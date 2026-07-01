import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {forkJoin} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {GradeDefinition, Unit} from 'src/app/api/models/unit';
import {
  UnitContentContextType,
  UnitContentLink,
  UnitContentSite,
} from 'src/app/api/models/unit-content-link';
import {UnitContentLinkService} from 'src/app/api/services/unit-content-link.service';
import {UnitContentSiteService} from 'src/app/api/services/unit-content-site.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {ProjectContentComponent} from 'src/app/projects/states/content/project-content.component';

interface UnitContentRow {
  label: string;
  contextType: UnitContentContextType;
  contextKey: string;
  unitContentSiteId: number | null;
  route: string;
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
  public rows: UnitContentRow[] = [];
  public loading = true;
  public saving = false;
  public uploading = false;
  public readonly siteDisplayedColumns = ['name', 'rootDir', 'isMain', 'actions'];
  public readonly displayedColumns = ['context', 'site', 'route', 'preview'];
  private savedRows: UnitContentRow[] = [];

  constructor(
    private dialog: MatDialog,
    private unitContentLinkService: UnitContentLinkService,
    private unitContentSiteService: UnitContentSiteService,
    private alerts: AlertService,
  ) {}

  public ngOnInit(): void {
    this.rows = this.defaultRows();
    this.loadContentManagement();
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
        this.sites = this.sites.map((currentSite) => ({
          ...currentSite,
          isMain: currentSite.id === updatedSite.id,
        }));
        this.alerts.success('Main content site updated', 2000);
      },
      error: (error) => this.alerts.error(`Failed to update main content site: ${error}`, 6000),
    });
  }

  public rootDirLabel(rootDir: string): string {
    return rootDir;
  }

  public previewSite(site: UnitContentSite): void {
    this.openPreview('/', site.id);
  }

  public previewRow(row: UnitContentRow): void {
    if (!row.unitContentSiteId) {
      return;
    }

    this.openPreview(row.route || '/', row.unitContentSiteId);
  }

  public rowHasUnsavedChanges(row: UnitContentRow): boolean {
    const savedRow = this.savedRows.find(
      (candidate) =>
        candidate.contextType === row.contextType && candidate.contextKey === row.contextKey,
    );

    if (!savedRow) {
      return !!row.unitContentSiteId;
    }

    return (
      savedRow.unitContentSiteId !== row.unitContentSiteId ||
      this.normalizedRoute(savedRow.route) !== this.normalizedRoute(row.route)
    );
  }

  public saveLinks(): void {
    const links = this.rows
      .filter((row) => row.unitContentSiteId)
      .map((row) => {
        const link = new UnitContentLink(this.unit);
        link.contextType = row.contextType;
        link.contextKey = row.contextKey;
        link.unitContentSiteId = row.unitContentSiteId;
        link.route = row.route || '/';
        return link;
      });

    this.saving = true;
    this.unitContentLinkService
      .updateForUnit(this.unit, links)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.alerts.success('Content routes updated', 2000);
          this.loadContentManagement();
        },
        error: (error) => this.alerts.error(`Failed to update content routes: ${error}`, 6000),
      });
  }

  private openPreview(contentRoute: string, contentSiteId: number): void {
    this.dialog.open(ProjectContentComponent, {
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
          this.rows = this.defaultRows().map((row) => {
            const link = links.find(
              (candidate) =>
                candidate.contextType === row.contextType &&
                candidate.contextKey === row.contextKey,
            );

            return {
              ...row,
              unitContentSiteId: link?.unitContentSiteId ?? null,
              route: link?.route ?? row.route,
            };
          });
          this.savedRows = this.rows.map((row) => ({...row}));
        },
        error: (error) => this.alerts.error(`Failed to load unit content: ${error}`, 6000),
      });
  }

  private defaultRows(): UnitContentRow[] {
    return [
      {
        label: 'Grade overview',
        contextType: 'grade_overview',
        contextKey: 'overview',
        unitContentSiteId: null,
        route: '/grades',
      },
      ...this.unit.gradeDefinitions
        .filter((grade) => grade.value >= 0)
        .map((grade: GradeDefinition) => ({
          label: grade.label,
          contextType: 'grade' as const,
          contextKey: grade.id,
          unitContentSiteId: null,
          route: `/grades/${grade.id}`,
        })),
    ];
  }

  private normalizedRoute(route: string): string {
    return `/${(route ?? '').replace(/^\/+|\/+$/g, '')}`;
  }
}
