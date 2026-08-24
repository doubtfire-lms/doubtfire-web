import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {forkJoin} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {GradeDefinition, Unit} from 'src/app/api/models/unit';
import {
  UnitContentContextType,
  UnitContentLink,
  UnitContentSite,
} from 'src/app/api/models/unit-content-link';
import {UnitContentLinkService} from 'src/app/api/services/unit-content-link.service';
import {UnitContentSiteService} from 'src/app/api/services/unit-content-site.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {UnitContentViewerComponent} from 'src/app/projects/states/content/unit-content-viewer.component';

interface ContentRouteSnapshot {
  route: string;
  unitContentSiteId: number | null;
}

interface ContentRouteRow extends ContentRouteSnapshot {
  contextKey: string;
  contextType: UnitContentContextType;
  defaultRoute: string;
  description: string;
  id: string;
  label: string;
  valueKind: 'file' | 'route';
}

interface ContentRouteSection {
  id: string;
  rows: ContentRouteRow[];
  subtitle: string;
  title: string;
  valueLabel: string;
}

interface ContentRouteSectionDefinition {
  buildRows: (unit: Unit) => ContentRouteRow[];
  id: string;
  subtitle: string;
  title: string;
  valueLabel: string;
}

@Component({
  selector: 'f-unit-content-editor',
  templateUrl: './unit-content-editor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitContentEditorComponent implements OnInit {
  @Input() unit: Unit;

  public sites: UnitContentSite[] = [];
  public routeSections: ContentRouteSection[] = [];
  public loading = true;
  public saving = false;
  public uploading = false;
  public editingSiteNames: Record<number, string> = {};
  public readonly siteDisplayedColumns = ['name', 'rootDir', 'isMain', 'contentActions'];
  public readonly routeDisplayedColumns = ['context', 'site', 'route', 'preview'];

  private replacingSiteIds: Set<number> = new Set();
  private readonly routeSectionDefinitions: ContentRouteSectionDefinition[] = [
    {
      id: 'grades',
      title: 'Grade Routes',
      subtitle: 'Choose the content route each target grade should open.',
      valueLabel: 'Route',
      buildRows: (unit) => this.gradeRouteRows(unit),
    },
    {
      id: 'task-sheets',
      title: 'Task Sheet Routes',
      subtitle: 'Replace task sheet PDFs with saved routes from uploaded unit content.',
      valueLabel: 'Route',
      buildRows: (unit) => this.taskSheetRouteRows(unit),
    },
    {
      id: 'task-resources',
      title: 'Task Resources',
      subtitle: 'Replace uploaded task resource ZIPs with files from uploaded unit content.',
      valueLabel: 'File path',
      buildRows: (unit) => this.taskResourceRows(unit),
    },
  ];

  private savedRouteSnapshots: Map<string, ContentRouteSnapshot> = new Map();

  constructor(
    private dialog: MatDialog,
    private unitContentLinkService: UnitContentLinkService,
    private unitContentSiteService: UnitContentSiteService,
    private confirmationModal: ConfirmationModalService,
    private alerts: AlertService,
    private fileDownloader: FileDownloaderService,
  ) {}

  public ngOnInit(): void {
    this.routeSections = this.buildRouteSections();
    this.loadContentManagement();
  }

  public get allRouteRows(): ContentRouteRow[] {
    return this.routeSections.flatMap((section) => section.rows);
  }

  public get hasUnsavedRouteChanges(): boolean {
    return this.allRouteRows.some((row) => this.routeHasUnsavedChanges(row));
  }

  public get hasInvalidResourcePaths(): boolean {
    return this.allRouteRows.some((row) => !this.resourcePathIsValid(row));
  }

  public uploadSites(files: File[]): void {
    const file = files[0];

    if (!file) {
      return;
    }

    this.uploading = true;
    this.unitContentSiteService
      .uploadForUnit(this.unit, file)
      .pipe(finalize(() => (this.uploading = false)))
      .subscribe({
        next: () => {
          this.alerts.success('Content site uploaded', 2000);
          this.loadContentManagement();
        },
        error: (error) => this.alerts.error(`Failed to upload content site: ${error}`, 6000),
      });
  }

  public deleteSite(site: UnitContentSite): void {
    this.unitContentSiteService.deleteForUnit(this.unit, site).subscribe({
      next: () => {
        this.alerts.success('Content site deleted', 2000);
        this.loadContentManagement();
      },
      error: (error) => this.alerts.error(`Failed to delete content site: ${error}`, 6000),
    });
  }

  public downloadSite(site: UnitContentSite): void {
    this.fileDownloader.downloadFile(
      this.unitContentSiteService.archiveUrlForUnit(this.unit, site),
      site.originalFilename,
    );
  }

  public confirmReplaceSite(site: UnitContentSite, input: HTMLInputElement): void {
    this.confirmationModal.show(
      'Overwrite content site ZIP',
      `Are you sure you want to overwrite the ZIP contents for "${site.name}"? This action is irreversible.`,
      () => input.click(),
      undefined,
      'Replace ZIP',
    );
  }

  public replaceSite(site: UnitContentSite, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    input.value = '';

    if (!file) {
      return;
    }

    this.replacingSiteIds.add(site.id);
    this.unitContentSiteService
      .replaceArchiveForUnit(this.unit, site, file)
      .pipe(finalize(() => this.replacingSiteIds.delete(site.id)))
      .subscribe({
        next: (updatedSite) => {
          this.sites = this.sites.map((currentSite) =>
            currentSite.id === updatedSite.id ? updatedSite : currentSite,
          );
          this.alerts.success('Content site replaced', 2000);
        },
        error: (error) => this.alerts.error(`Failed to replace content site: ${error}`, 6000),
      });
  }

  public replacingSite(site: UnitContentSite): boolean {
    return this.replacingSiteIds.has(site.id);
  }

  public editingSite(site: UnitContentSite): boolean {
    return site.id in this.editingSiteNames;
  }

  public editSiteName(site: UnitContentSite): void {
    this.editingSiteNames[site.id] = site.name;
  }

  public cancelEditSiteName(site: UnitContentSite): void {
    delete this.editingSiteNames[site.id];
  }

  public saveSiteName(site: UnitContentSite): void {
    const name = this.editingSiteNames[site.id]?.trim();

    if (!name) {
      this.alerts.error('Content site name cannot be blank', 3000);
      return;
    }

    if (name === site.name) {
      this.cancelEditSiteName(site);
      return;
    }

    this.unitContentSiteService.updateForUnit(this.unit, site, {name}).subscribe({
      next: (updatedSite) => {
        this.sites = this.sites.map((currentSite) =>
          currentSite.id === updatedSite.id ? updatedSite : currentSite,
        );
        this.alerts.success('Content site name updated', 2000);
        this.cancelEditSiteName(site);
      },
      error: (error) => this.alerts.error(`Failed to update content site name: ${error}`, 6000),
    });
  }

  public updateSiteRootDir(site: UnitContentSite, rootDir: string): void {
    this.unitContentSiteService.updateForUnit(this.unit, site, {rootDir}).subscribe({
      next: (updatedSite) => {
        this.sites = this.sites.map((currentSite) =>
          currentSite.id === updatedSite.id ? updatedSite : currentSite,
        );
        this.alerts.success('Content site root updated', 2000);
      },
      error: (error) => this.alerts.error(`Failed to update content site root: ${error}`, 6000),
    });
  }

  public updateMainSite(site: UnitContentSite): void {
    this.unitContentSiteService.updateForUnit(this.unit, site, {isMain: true}).subscribe({
      next: (updatedSite) => {
        this.sites.forEach((currentSite) => {
          currentSite.isMain = currentSite.id === updatedSite.id;
        });
        this.unit.hasMainContentSite = true;
        this.alerts.success('Main content site updated', 2000);
      },
      error: (error) => this.alerts.error(`Failed to update main content site: ${error}`, 6000),
    });
  }

  public clearMainSite(): void {
    const mainSite = this.sites.find((site) => site.isMain);

    if (!mainSite) {
      return;
    }

    this.unitContentSiteService.updateForUnit(this.unit, mainSite, {isMain: false}).subscribe({
      next: () => {
        this.sites.forEach((site) => {
          site.isMain = false;
        });
        this.unit.hasMainContentSite = false;
        this.alerts.success('Default content site cleared', 2000);
      },
      error: (error) => this.alerts.error(`Failed to clear default content site: ${error}`, 6000),
    });
  }

  public previewSite(site: UnitContentSite): void {
    this.openPreview('/', site.id);
  }

  public previewRoute(row: ContentRouteRow): void {
    if (!this.routeCanBePreviewed(row)) {
      return;
    }

    this.openPreview(row.route || '/', row.unitContentSiteId);
  }

  public routeCanBePreviewed(row: ContentRouteRow): boolean {
    return (
      row.valueKind === 'route' && !!row.unitContentSiteId && !this.routeHasUnsavedChanges(row)
    );
  }

  public updateRowSite(row: ContentRouteRow, siteId: number | null): void {
    row.unitContentSiteId = siteId;

    if (row.valueKind !== 'file') {
      return;
    }

    if (!siteId || !this.filePathsForRow(row).includes(row.route)) {
      row.route = '';
    }
  }

  public filePathsForRow(row: ContentRouteRow): string[] {
    return this.sites.find((site) => site.id === row.unitContentSiteId)?.filePaths ?? [];
  }

  public resourcePathIsValid(row: ContentRouteRow): boolean {
    if (row.valueKind !== 'file' || !row.unitContentSiteId) {
      return true;
    }

    return this.filePathsForRow(row).includes(this.normalizedRoute(row.route));
  }

  public routeHasUnsavedChanges(row: ContentRouteRow): boolean {
    const savedRoute = this.savedRouteSnapshots.get(row.id);

    if (!savedRoute) {
      return !!row.unitContentSiteId;
    }

    if (!savedRoute.unitContentSiteId && !row.unitContentSiteId) {
      return false;
    }

    return (
      savedRoute.unitContentSiteId !== row.unitContentSiteId ||
      this.normalizedRoute(savedRoute.route) !== this.normalizedRoute(row.route)
    );
  }

  public saveContentRoutes(): void {
    const links = this.allRouteRows
      .filter((row) => row.unitContentSiteId && this.resourcePathIsValid(row))
      .map((row) => this.contentLinkFromRoute(row));

    this.saving = true;
    this.unitContentLinkService
      .updateForUnit(this.unit, links)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.alerts.success('Content links updated', 2000);
          this.loadContentManagement();
        },
        error: (error) => this.alerts.error(`Failed to update content links: ${error}`, 6000),
      });
  }

  private openPreview(contentRoute: string, contentSiteId: number): void {
    this.dialog.open(UnitContentViewerComponent, {
      data: {
        contentRoute,
        contentSiteId,
        unit: this.unit,
      },
      height: '90vh',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'overflow-hidden',
      width: 'calc(100vw - 32px)',
    });
  }

  private loadContentManagement(): void {
    this.loading = true;

    forkJoin({
      sites: this.unitContentSiteService.getForUnit(this.unit),
      links: this.unitContentLinkService.loadForUnit(this.unit),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({sites, links}) => {
          this.sites = sites;
          this.unit.hasMainContentSite = sites.some((site) => site.isMain);
          this.routeSections = this.buildRouteSections(links);
          this.savedRouteSnapshots = this.snapshotRoutes(this.allRouteRows);
        },
        error: (error) => this.alerts.error(`Failed to load unit content: ${error}`, 6000),
      });
  }

  private buildRouteSections(savedLinks: UnitContentLink[] = []): ContentRouteSection[] {
    return this.routeSectionDefinitions.map((definition) => ({
      id: definition.id,
      title: definition.title,
      subtitle: definition.subtitle,
      valueLabel: definition.valueLabel,
      rows: definition
        .buildRows(this.unit)
        .map((row) => this.applySavedContentLink(row, savedLinks)),
    }));
  }

  private gradeRouteRows(unit: Unit): ContentRouteRow[] {
    return [
      this.contentRouteRow({
        label: 'Grade overview',
        description: 'Overview shown before a student selects a target grade.',
        contextType: 'grade_overview',
        contextKey: 'overview',
        defaultRoute: '/grades',
        valueKind: 'route',
      }),
      ...unit.gradeDefinitions
        .filter((grade) => grade.value >= 0)
        .map((grade: GradeDefinition) =>
          this.contentRouteRow({
            label: grade.label,
            description: `${grade.abbreviation} target grade content.`,
            contextType: 'grade',
            contextKey: grade.id,
            defaultRoute: `/grades/${grade.id}`,
            valueKind: 'route',
          }),
        ),
    ];
  }

  private taskSheetRouteRows(unit: Unit): ContentRouteRow[] {
    return unit.taskDefinitions.map((taskDefinition: TaskDefinition) =>
      this.contentRouteRow({
        label: `${taskDefinition.abbreviation} ${taskDefinition.name}`,
        description: 'Task sheet replacement content.',
        contextType: 'task_definition',
        contextKey: taskDefinition.abbreviation,
        defaultRoute: `/tasks/${taskDefinition.abbreviation}`,
        valueKind: 'route',
      }),
    );
  }

  private taskResourceRows(unit: Unit): ContentRouteRow[] {
    return unit.taskDefinitions.map((taskDefinition: TaskDefinition) =>
      this.contentRouteRow({
        label: `${taskDefinition.abbreviation} ${taskDefinition.name}`,
        description: 'Task resource replacement file.',
        contextType: 'task_definition_resource',
        contextKey: taskDefinition.abbreviation,
        defaultRoute: '',
        valueKind: 'file',
      }),
    );
  }

  private contentRouteRow(params: {
    contextKey: string;
    contextType: UnitContentContextType;
    defaultRoute: string;
    description: string;
    label: string;
    valueKind: 'file' | 'route';
  }): ContentRouteRow {
    return {
      ...params,
      id: this.routeId(params.contextType, params.contextKey),
      route: params.defaultRoute,
      unitContentSiteId: null,
    };
  }

  private applySavedContentLink(
    row: ContentRouteRow,
    savedLinks: UnitContentLink[],
  ): ContentRouteRow {
    const link = savedLinks.find(
      (candidate) =>
        candidate.contextType === row.contextType && candidate.contextKey === row.contextKey,
    );

    if (!link) {
      return row;
    }

    return {
      ...row,
      route: link.route ?? row.defaultRoute,
      unitContentSiteId: link.unitContentSiteId,
    };
  }

  private contentLinkFromRoute(row: ContentRouteRow): UnitContentLink {
    const link = new UnitContentLink(this.unit);

    link.contextType = row.contextType;
    link.contextKey = row.contextKey;
    link.unitContentSiteId = row.unitContentSiteId;
    link.route = this.normalizedRoute(row.route || row.defaultRoute);

    return link;
  }

  private snapshotRoutes(rows: ContentRouteRow[]): Map<string, ContentRouteSnapshot> {
    return new Map(
      rows.map((row) => [
        row.id,
        {
          route: row.route,
          unitContentSiteId: row.unitContentSiteId,
        },
      ]),
    );
  }

  private routeId(contextType: UnitContentContextType, contextKey: string): string {
    return `${contextType}:${contextKey}`;
  }

  private normalizedRoute(route: string): string {
    return `/${(route ?? '').replace(/^\/+|\/+$/g, '')}`;
  }
}
