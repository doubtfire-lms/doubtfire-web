import {HttpParams} from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription, combineLatest} from 'rxjs';
import {Project, Task, Unit} from 'src/app/api/models/doubtfire-model';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import API_URL from 'src/app/config/constants/apiUrl';
import {GlobalStateService, ViewType} from '../index/global-state.service';
import {UnitContentArchive} from './unit-content-archive';

export interface UnitContentViewerDialogData {
  contentSiteId?: number;
  contentRoute: string;
  unit: Unit;
}

@Component({
  selector: 'f-unit-content-viewer',
  templateUrl: './unit-content-viewer.component.html',
  styleUrl: './unit-content-viewer.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitContentViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('primaryContentIframe') primaryContentIframe?: ElementRef<HTMLIFrameElement>;
  @ViewChild('secondaryContentIframe') secondaryContentIframe?: ElementRef<HTMLIFrameElement>;

  @Input() public contentRoute = '/';
  @Input() public contentSiteId?: number;
  @Input() public task?: Task;
  @Input() public unit?: Unit;

  public isLoadingArchive = false;
  public archiveError?: string;

  public get contentShellClass(): string {
    return this.dialogData
      ? 'relative flex h-full min-h-0 flex-col bg-[#f7f8fa]'
      : 'relative flex min-h-[calc(100vh-64px)] flex-col bg-[#f7f8fa]';
  }

  public contentIframeClass(frameIndex: number): string {
    const base = 'absolute inset-0 h-full w-full border-0 bg-white';

    return frameIndex === this.activeIframeIndex
      ? `${base} visible opacity-100`
      : `${base} invisible opacity-0`;
  }

  private contentArchive?: UnitContentArchive;
  private currentUnitId?: number;
  private contentFragment?: string;
  private activeIframeIndex = 0;
  private iframeClickCleanups: Array<(() => void) | undefined> = [];
  private iframeReady = false;
  private iframeUrls: Array<string | undefined> = [];
  private loadingIframeIndex?: number;
  private pendingContentArchive?: UnitContentArchive;
  private pendingIframeUrl?: string;
  private archiveLoadSequence = 0;
  private retiredContentArchives: UnitContentArchive[] = [];
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalState: GlobalStateService,
    private fileDownloader: FileDownloaderService,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData?: UnitContentViewerDialogData,
  ) {}

  public ngOnInit(): void {
    if (this.unit) {
      this.dialogData = {
        contentRoute: this.contentRoute,
        contentSiteId: this.contentSiteId,
        unit: this.unit,
      };
    }

    if (this.dialogData) {
      this.setContentRouteFromPath(this.dialogData.contentRoute);
      this.setHeaderContext(this.dialogData.unit);
      void this.fetchContentArchive(this.dialogData.unit.id);
      return;
    }

    const unit = this.route.parent?.snapshot.data.unit as Unit | undefined;
    this.setContentRouteFromLocation(
      this.route.snapshot.paramMap.get('contentRoute'),
      this.route.snapshot.queryParamMap.get('q'),
    );
    this.setContentFragment(this.route.snapshot.fragment);

    if (unit) {
      if (this.redirectFromUnavailableDefaultContent(unit)) {
        return;
      }

      this.setHeaderContext(unit);
      void this.fetchContentArchive(unit.id);
    }

    this.routeSubscription = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
      this.route.fragment,
    ]).subscribe(([paramMap, queryParamMap, fragment]) => {
      const routeChanged = this.setContentRouteFromLocation(
        paramMap.get('contentRoute'),
        queryParamMap.get('q'),
      );
      const fragmentChanged = this.setContentFragment(fragment);

      if (unit && this.redirectFromUnavailableDefaultContent(unit)) {
        return;
      }

      if ((routeChanged || fragmentChanged) && this.currentUnitId) {
        void this.fetchContentArchive(this.currentUnitId, this.contentFragment);
      }
    });
  }

  public ngAfterViewInit(): void {
    this.iframeReady = true;
    this.applyPendingIframeUrl();
  }

  public ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.clearIframeClickHandlers();
    this.pendingContentArchive?.dispose();
    this.contentArchive?.dispose();
    this.disposeRetiredContentArchives();
  }

  public onIframeLoad(frameIndex: number): void {
    if (!this.isExpectedIframeLoad(frameIndex)) {
      return;
    }

    if (frameIndex === this.loadingIframeIndex) {
      this.activeIframeIndex = frameIndex;
      this.loadingIframeIndex = undefined;

      this.activatePendingContentArchive();
      this.disposeRetiredContentArchives();
    }

    if (frameIndex === this.activeIframeIndex) {
      this.clearIframeClickHandlers();
      this.attachIframeClickHandler(frameIndex);
    }
  }

  private setHeaderContext(unit: Unit): void {
    const studentProject = this.studentProjectForUnit(unit);

    if (unit.myRole === 'Student' && studentProject) {
      this.globalState.setView(ViewType.PROJECT, studentProject);
      return;
    }

    this.globalState.setView(ViewType.UNIT, unit);
  }

  private redirectFromUnavailableDefaultContent(unit: Unit): boolean {
    if (this.dialogData || unit.hasMainContentSite || this.contentRoute !== '/') {
      return false;
    }

    const studentProject = this.studentProjectForUnit(unit);
    const commands =
      unit.myRole === 'Student' && studentProject
        ? ['/projects', studentProject.id, 'dashboard']
        : ['/units', unit.id, 'tasks', 'inbox'];

    void this.router.navigate(commands, {replaceUrl: true});

    return true;
  }

  private studentProjectForUnit(unit: Unit): Project | undefined {
    return this.globalState.currentUserProjects.currentValues.find(
      (project: Project) => project.unit?.id === unit.id,
    );
  }

  private handleIframeClick(event: MouseEvent): void {
    const target = event.target as {closest?: (selector: string) => HTMLElement | null};

    if (this.handleOnTrackAction(event, target)) {
      return;
    }

    const link = (target?.closest?.('a[href]') as HTMLAnchorElement | null) ?? null;

    if (!link) {
      return;
    }

    const downloadFilename = link.getAttribute('download')?.trim();

    if (link.href.startsWith('blob:') && downloadFilename) {
      event.preventDefault();
      this.fileDownloader.downloadBlobToFile(link.href, downloadFilename);
      return;
    }

    if (link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const archiveRoute =
      this.contentArchive?.routeFromHref(link.getAttribute('href'), this.contentRoute) ??
      this.routeFromHref(link.getAttribute('href'));

    if (!archiveRoute || !this.currentUnitId) {
      return;
    }

    event.preventDefault();

    if (this.dialogData) {
      this.setContentRouteFromPath(archiveRoute.path);
      void this.loadCurrentArchiveRoute(archiveRoute.fragment);
      return;
    }

    void this.router.navigate(this.contentRouteCommands(archiveRoute.path), {
      fragment: archiveRoute.fragment,
    });
  }

  private handleOnTrackAction(
    event: MouseEvent,
    target: {closest?: (selector: string) => HTMLElement | null},
  ): boolean {
    const actionElement = target?.closest?.('[data-ontrack-action]') ?? null;
    const action = actionElement?.getAttribute('data-ontrack-action');

    if (!event.isTrusted || !actionElement || !action) {
      return false;
    }

    const taskAbbreviation = actionElement.getAttribute('data-ontrack-task')?.trim();
    const task = taskAbbreviation ? this.taskForContentAction(taskAbbreviation) : undefined;

    if (action === 'download-task-resources') {
      if (task?.definition.hasTaskResources) {
        event.preventDefault();
        this.fileDownloader.downloadFile(
          task.definition.getTaskResourcesUrl(true),
          `${task.definition.abbreviation}-resources.zip`,
        );
        return true;
      }

      return false;
    }

    if (action !== 'move-to-working-on-it' || !task || task.unit.myRole !== 'Student') {
      return false;
    }

    event.preventDefault();
    void task.triggerTransition('working_on_it');

    return true;
  }

  private taskForContentAction(abbreviation: string): Task | undefined {
    if (this.task?.definition.abbreviation === abbreviation) {
      return this.task;
    }

    const project = this.globalState.currentUserProjects.currentValues.find(
      (candidate) => candidate.unit?.id === this.currentUnitId,
    );

    return project?.taskCache.currentValues.find(
      (task) => task.definition.abbreviation === abbreviation,
    );
  }

  private async fetchContentArchive(unitId: number, fragment?: string): Promise<void> {
    const contentRoute = this.contentRoute;

    ++this.archiveLoadSequence;
    this.isLoadingArchive = true;
    this.archiveError = undefined;
    this.currentUnitId = unitId;

    const params = this.contentArchiveParams(contentRoute);
    const iframeUrl = `${API_URL}/units/${unitId}/content2?${params.toString()}`;

    this.loadIframeUrl(iframeUrl, fragment);
    this.isLoadingArchive = false;
  }

  private async loadCurrentArchiveRoute(fragment?: string): Promise<void> {
    if (!this.currentUnitId) {
      return;
    }

    await this.fetchContentArchive(this.currentUnitId, fragment);
  }

  private routeFromHref(
    href: string | null,
  ): {path: string; fragment?: string} | undefined {
    if (!href || href.startsWith('#')) {
      return undefined;
    }

    let url: URL;

    try {
      const baseRoute = this.contentRoute.endsWith('/')
        ? this.contentRoute
        : `${this.contentRoute}/`;
      url = new URL(href, `https://archive.local${baseRoute}`);
    } catch {
      return undefined;
    }

    if (url.hostname !== 'archive.local') {
      return undefined;
    }

    return {
      path: url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/g, ''),
      fragment: url.hash ? url.hash.slice(1) : undefined,
    };
  }

  private stageContentArchive(archive: UnitContentArchive): void {
    if (this.pendingContentArchive) {
      this.retiredContentArchives.push(this.pendingContentArchive);
    }

    this.pendingContentArchive = archive;
  }

  private activatePendingContentArchive(): void {
    if (!this.pendingContentArchive) {
      return;
    }

    if (this.contentArchive) {
      this.retiredContentArchives.push(this.contentArchive);
    }

    this.contentArchive = this.pendingContentArchive;
    this.pendingContentArchive = undefined;
  }

  private disposeRetiredContentArchives(): void {
    this.retiredContentArchives.forEach((archive) => archive.dispose());
    this.retiredContentArchives = [];
  }

  private isExpectedIframeLoad(frameIndex: number): boolean {
    if (this.loadingIframeIndex !== undefined && frameIndex !== this.loadingIframeIndex) {
      return false;
    }

    const iframe = this.contentIframe(frameIndex);
    const expectedUrl = this.iframeUrls[frameIndex];

    if (!expectedUrl || !iframe?.contentWindow) {
      return true;
    }

    try {
      return iframe.contentWindow.location.href === expectedUrl;
    } catch {
      return true;
    }
  }

  private contentArchiveParams(contentRoute: string): HttpParams {
    let params = new HttpParams().set('content_route', contentRoute);

    if (this.dialogData?.contentSiteId) {
      params = params.set('content_site_id', this.dialogData.contentSiteId);
    }

    return params;
  }

  private loadIframeUrl(url: string, fragment?: string): void {
    const nextUrl = fragment ? `${url}#${fragment}` : url;

    if (this.iframeUrls[this.activeIframeIndex] === nextUrl) {
      return;
    }

    this.pendingIframeUrl = nextUrl;
    this.applyPendingIframeUrl();
  }

  private applyPendingIframeUrl(): void {
    if (!this.iframeReady || !this.pendingIframeUrl) {
      return;
    }

    const url = this.pendingIframeUrl;
    const frameIndex = this.iframeUrls[this.activeIframeIndex]
      ? this.inactiveIframeIndex()
      : this.activeIframeIndex;
    const iframe = this.contentIframe(frameIndex);

    if (!iframe) {
      return;
    }

    this.pendingIframeUrl = undefined;
    this.loadingIframeIndex = frameIndex;
    this.iframeUrls[frameIndex] = url;

    if (iframe.contentWindow) {
      iframe.contentWindow.location.replace(url);
      return;
    }

    iframe.src = url;
  }

  private contentIframe(frameIndex: number): HTMLIFrameElement | undefined {
    return frameIndex === 0
      ? this.primaryContentIframe?.nativeElement
      : this.secondaryContentIframe?.nativeElement;
  }

  private inactiveIframeIndex(): number {
    return this.activeIframeIndex === 0 ? 1 : 0;
  }

  private attachIframeClickHandler(frameIndex: number): void {
    this.iframeClickCleanups[frameIndex]?.();
    this.iframeClickCleanups[frameIndex] = undefined;

    const doc = this.contentIframe(frameIndex)?.contentDocument;

    if (!doc) {
      return;
    }

    const clickHandler = (event: MouseEvent) => this.handleIframeClick(event);

    doc.addEventListener('click', clickHandler, true);
    this.iframeClickCleanups[frameIndex] = () =>
      doc.removeEventListener('click', clickHandler, true);
  }

  private clearIframeClickHandlers(): void {
    this.iframeClickCleanups.forEach((cleanup) => cleanup?.());
    this.iframeClickCleanups = [];
  }

  private setContentRouteFromLocation(path: string | null, legacyQueryPath: string | null): boolean {
    return this.setContentRouteFromPath(this.decodedContentRoute(path ?? legacyQueryPath ?? '/'));
  }

  private setContentFragment(fragment: string | null): boolean {
    const normalizedFragment = fragment ?? undefined;
    const fragmentChanged = this.contentFragment !== normalizedFragment;

    this.contentFragment = normalizedFragment;

    return fragmentChanged;
  }

  private contentRouteCommands(path: string): Array<string | number> {
    const routeParts = this.normalizedArchivePath(this.decodedContentRoute(path))
      .split('/')
      .filter(Boolean);

    return ['/units', this.currentUnitId!, 'content', ...routeParts];
  }

  private setContentRouteFromPath(path: string): boolean {
    const normalizedRoute = this.normalizedRouteFromPath(path);
    const routeChanged = this.contentRoute !== normalizedRoute;

    this.contentRoute = normalizedRoute;

    return routeChanged;
  }

  private normalizedRouteFromPath(path: string): string {
    const route = this.normalizedArchivePath(path);

    return route ? `/${route}` : '/';
  }

  private normalizedArchivePath(path: string): string {
    return path.replace(/^\/+|\/+$/g, '');
  }

  private decodedContentRoute(path: string): string {
    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  }
}
