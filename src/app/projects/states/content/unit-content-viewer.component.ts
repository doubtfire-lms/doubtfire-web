import {HttpParams} from '@angular/common/http';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription, combineLatest, firstValueFrom} from 'rxjs';
import {
  AuthenticationService,
  Project,
  Task,
  Unit,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import API_URL from 'src/app/config/constants/apiUrl';
import {GlobalStateService, ViewType} from '../index/global-state.service';

export interface UnitContentViewerDialogData {
  contentSiteId?: number;
  contentRoute: string;
  unit: Unit;
}

@Component({
  selector: 'f-unit-content-viewer',
  templateUrl: './unit-content-viewer.component.html',
  standalone: false,
})
export class UnitContentViewerComponent implements OnChanges, OnInit, OnDestroy {
  @ViewChild('primaryContentIframe')
  private set primaryContentIframeRef(element: ElementRef<HTMLIFrameElement> | undefined) {
    this.contentIframes[0] = element?.nativeElement;
    this.applyPendingIframeUrl();
  }

  @ViewChild('secondaryContentIframe')
  private set secondaryContentIframeRef(element: ElementRef<HTMLIFrameElement> | undefined) {
    this.contentIframes[1] = element?.nativeElement;
    this.applyPendingIframeUrl();
  }

  @Input() public contentRoute = '/';
  @Input() public contentSiteId?: number;
  @Input() public task?: Task;
  @Input() public unit?: Unit;

  public get contentShellClass(): string {
    return this.dialogData
      ? 'relative flex h-full min-h-0 flex-col bg-[#f7f8fa]'
      : 'relative flex min-h-[calc(100vh-64px)] flex-col bg-[#f7f8fa]';
  }

  public contentIframeClass(frameIndex: number): string {
    const base = 'absolute inset-0 size-full border-0 bg-white';

    return frameIndex === this.activeIframeIndex
      ? `${base} visible opacity-100`
      : `${base} invisible opacity-0`;
  }

  private activeIframeIndex = 0;
  private contentIframes: Array<HTMLIFrameElement | undefined> = [];
  private currentUnitId?: number;
  private contentRequestId = 0;
  private iframeUrls: Array<string | undefined> = [];
  private loadingIframeIndex?: number;
  private pendingIframeUrl?: string;
  private routeSubscription?: Subscription;
  private initialized = false;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private globalState: GlobalStateService,
    private fileDownloader: FileDownloaderService,
    private userService: UserService,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData?: UnitContentViewerDialogData,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (
      !this.initialized ||
      !this.unit ||
      !('contentRoute' in changes || 'contentSiteId' in changes || 'unit' in changes)
    ) {
      return;
    }

    this.configureInputContent();
  }

  public ngOnInit(): void {
    this.initialized = true;

    if (this.unit) {
      this.configureInputContent();
      return;
    }

    if (this.dialogData) {
      this.setContentRoute(this.dialogData.contentRoute);
      this.setHeaderContext(this.dialogData.unit);
      void this.loadContentRoute(this.dialogData.unit.id);
      return;
    }

    const unit = this.route.parent?.snapshot.data.unit as Unit | undefined;

    if (!unit) {
      return;
    }

    this.setHeaderContext(unit);
    this.routeSubscription = combineLatest([this.route.paramMap, this.route.fragment]).subscribe(
      ([paramMap, fragment]) => {
        this.setContentRoute(paramMap.get('contentRoute') ?? '/');

        if (this.redirectFromUnavailableDefaultContent(unit)) {
          return;
        }

        void this.loadContentRoute(unit.id, fragment ?? undefined);
      },
    );
  }

  private configureInputContent(): void {
    this.dialogData = {
      contentRoute: this.contentRoute,
      contentSiteId: this.contentSiteId,
      unit: this.unit!,
    };
    this.setContentRoute(this.dialogData.contentRoute);
    this.setHeaderContext(this.dialogData.unit);
    void this.loadContentRoute(this.dialogData.unit.id);
  }

  public ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  public onIframeLoad(frameIndex: number): void {
    if (frameIndex !== this.loadingIframeIndex || !this.isExpectedIframeLoad(frameIndex)) {
      return;
    }

    this.activeIframeIndex = frameIndex;
    this.loadingIframeIndex = undefined;

    this.contentIframes[frameIndex]?.contentDocument?.addEventListener(
      'click',
      (event) => this.handleIframeClick(event),
      true,
    );
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
    const target = event.target as Element | null;

    if (this.handleOnTrackAction(event, target)) {
      return;
    }

    const link = target?.closest<HTMLAnchorElement>('a[href]');

    if (!link) {
      return;
    }

    if (link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const route = this.routeFromHref(link.getAttribute('href'));

    if (!route || !this.currentUnitId) {
      return;
    }

    event.preventDefault();

    if (/\.docx$/i.test(route.path)) {
      void this.downloadContentDocument(route.path);
      return;
    }

    if (this.dialogData) {
      this.setContentRoute(route.path);
      void this.loadContentRoute(this.currentUnitId, route.fragment);
      return;
    }

    void this.router.navigate(this.contentRouteCommands(route.path), {
      fragment: route.fragment,
    });
  }

  private handleOnTrackAction(event: MouseEvent, target: Element | null): boolean {
    const actionElement = target?.closest<HTMLElement>('[data-ontrack-action]');
    const action = actionElement?.dataset.ontrackAction;

    if (!event.isTrusted || !actionElement || !action) {
      return false;
    }

    const taskAbbreviation = actionElement.dataset.ontrackTask?.trim();
    const task = taskAbbreviation ? this.taskForContentAction(taskAbbreviation) : undefined;

    if (action === 'download-task-resources') {
      if (!task?.definition.hasTaskResources) {
        return false;
      }

      event.preventDefault();
      this.fileDownloader.downloadFile(
        task.definition.getTaskResourcesUrl(true),
        `${task.definition.abbreviation}-resources.zip`,
      );
      return true;
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

  private async loadContentRoute(unitId: number, fragment?: string): Promise<void> {
    const requestId = ++this.contentRequestId;
    const contentRoute = this.contentRoute;

    this.currentUnitId = unitId;

    try {
      const url = await this.contentUrl(unitId, contentRoute);

      if (requestId === this.contentRequestId) {
        this.setIframeUrl(url, fragment);
      }
    } catch {
      // Authentication errors are handled by the global HTTP interceptor.
    }
  }

  private async downloadContentDocument(path: string): Promise<void> {
    if (!this.currentUnitId) {
      return;
    }

    try {
      const filename = this.decodeRoute(path).split('/').pop() ?? 'document.docx';

      this.fileDownloader.downloadBlobToFile(
        await this.contentUrl(this.currentUnitId, path),
        filename,
      );
    } catch {
      // Authentication errors are handled by the global HTTP interceptor.
    }
  }

  private async contentUrl(unitId: number, contentRoute: string): Promise<string> {
    const params = await this.contentRequestParams(contentRoute);

    return `${API_URL}/units/${unitId}/content?${params.toString()}`;
  }

  private async contentRequestParams(contentRoute: string): Promise<HttpParams> {
    const contentToken = await firstValueFrom(this.authService.getContentToken());
    let params = new HttpParams()
      .set('content_route', contentRoute)
      .set('username', this.userService.currentUser.username)
      .set('content_token', contentToken);

    if (this.dialogData?.contentSiteId) {
      params = params.set('content_site_id', this.dialogData.contentSiteId);
    }

    return params;
  }

  private routeFromHref(href: string | null): {path: string; fragment?: string} | undefined {
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

    let pathEnd = url.pathname.length;

    while (pathEnd > 1 && url.pathname[pathEnd - 1] === '/') {
      pathEnd -= 1;
    }

    return {
      path: url.pathname.slice(0, pathEnd),
      fragment: url.hash ? url.hash.slice(1) : undefined,
    };
  }

  private setIframeUrl(url: string, fragment?: string): void {
    const nextUrl = fragment ? `${url}#${fragment}` : url;

    if (this.iframeUrls[this.activeIframeIndex] === nextUrl) {
      return;
    }

    this.pendingIframeUrl = nextUrl;
    this.applyPendingIframeUrl();
  }

  private applyPendingIframeUrl(): void {
    if (!this.pendingIframeUrl) {
      return;
    }

    const frameIndex =
      this.loadingIframeIndex ??
      (this.iframeUrls[this.activeIframeIndex]
        ? this.inactiveIframeIndex()
        : this.activeIframeIndex);
    const iframe = this.contentIframes[frameIndex];

    if (!iframe) {
      return;
    }

    const url = this.pendingIframeUrl;

    this.pendingIframeUrl = undefined;
    this.loadingIframeIndex = frameIndex;
    this.iframeUrls[frameIndex] = url;
    iframe.src = url;
  }

  private isExpectedIframeLoad(frameIndex: number): boolean {
    const iframe = this.contentIframes[frameIndex];
    const expectedUrl = this.iframeUrls[frameIndex];

    if (!iframe?.contentWindow || !expectedUrl) {
      return false;
    }

    try {
      return iframe.contentWindow.location.href === expectedUrl;
    } catch {
      return true;
    }
  }

  private inactiveIframeIndex(): number {
    return this.activeIframeIndex === 0 ? 1 : 0;
  }

  private setContentRoute(path: string): void {
    const route = this.normalizedRoute(this.decodeRoute(path));
    this.contentRoute = route ? `/${route}` : '/';
  }

  private contentRouteCommands(path: string): Array<string | number> {
    const routeParts = this.normalizedRoute(this.decodeRoute(path)).split('/').filter(Boolean);

    return ['/units', this.currentUnitId!, 'content', ...routeParts];
  }

  private normalizedRoute(path: string): string {
    return path.replace(/^\/+|\/+$/g, '');
  }

  private decodeRoute(path: string): string {
    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  }
}
