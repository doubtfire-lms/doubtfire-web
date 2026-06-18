import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, Subscription, first, of} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {AlertService} from 'src/app/common/services/alert.service';

type PortfolioTabKey =
  | 'select'
  | 'progress'
  | 'staff-notes'
  | 'portfolio'
  | 'assessment';

interface PortfolioTab {
  label: string;
  routeSegment: PortfolioTabKey;
  requiresProject: boolean;
}

@Component({
  selector: 'f-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrl: './portfolios.component.scss',
  standalone: false,
})
export class PortfoliosComponent implements OnInit, OnDestroy {
  @Input() unit$: Observable<Unit>;

  public readonly tabs: PortfolioTab[] = [
    {label: 'Select Student', routeSegment: 'select', requiresProject: false},
    {label: 'View Progress', routeSegment: 'progress', requiresProject: true},
    {
      label: 'View Staff Notes',
      routeSegment: 'staff-notes',
      requiresProject: true,
    },
    {label: 'View Portfolio', routeSegment: 'portfolio', requiresProject: true},
    {
      label: 'Assess Portfolio',
      routeSegment: 'assessment',
      requiresProject: true,
    },
  ];

  public unit: Unit = null;
  public selectedProject: Project | null = null;
  public selectedProject$: BehaviorSubject<Project | null> =
    new BehaviorSubject(null);
  public loadingStudents = true;
  public currentTab: PortfolioTab = this.tabs[0];

  private subscriptions: Subscription[] = [];
  private selectedProjectId: number | null = null;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
  ) {}

  public ngOnInit(): void {
    this.unit$ = this.unit$ ?? of(this.route.parent.snapshot.data.unit);
    this.subscriptions.push(
      this.unit$.pipe(first()).subscribe({
        next: (unit) => {
          this.unit = unit;
          this.unit.loadD2lMapping().subscribe();
          this.loadStudents();
          this.subscriptions.push(
            this.route.paramMap.subscribe((params) => {
              this.updateCurrentTabFromState(
                params.get('tab'),
                params.get('projectId'),
              );
            }),
          );
        },
        error: (error) => {
          this.alertService.error(`Failed to load unit: ${error}`, 6000);
          this.router.navigateByUrl('/home');
        },
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public get currentIndex(): number {
    const index = this.tabs.findIndex(
      (tab) => tab.routeSegment === this.currentTab.routeSegment,
    );
    return index >= 0 ? index : 0;
  }

  public get progressTaskSelectionUrlBase(): unknown[] | null {
    if (!this.unit || !this.selectedProject) {
      return null;
    }

    return [
      '/units',
      this.unit.id,
      'students',
      'portfolios',
      this.selectedProject.id,
      'progress',
    ];
  }

  public studentSelected(project: Project): void {
    this.navigateToProject(project.id, 'progress');
  }

  public onTabChange(event: MatTabChangeEvent): void {
    const nextTab = this.tabs[event.index] ?? this.tabs[0];
    this.currentTab = nextTab;

    if (nextTab.routeSegment === 'select' || !this.selectedProject) {
      this.router.navigate(['/units', this.unit.id, 'students', 'portfolios'], {
        replaceUrl: true,
      });
      return;
    }

    this.navigateToProject(this.selectedProject.id, nextTab.routeSegment);
  }

  private loadStudents(): void {
    this.projectService.loadStudents(this.unit, false).subscribe({
      next: () => {
        this.loadingStudents = false;
      },
      error: (error) => {
        this.alertService.error(`Failed to load unit: ${error}`, 6000);
        this.router.navigateByUrl('/home');
      },
    });
  }

  private updateCurrentTabFromState(
    tabParam?: string | null,
    projectIdParam?: string | null,
  ): void {
    const projectId = projectIdParam ? Number(projectIdParam) : null;
    const requestedTab = this.tabFromRoute(tabParam, !!projectId);

    this.currentTab = requestedTab;

    if (!projectId) {
      this.selectedProjectId = null;
      this.selectedProject = null;
      this.selectedProject$.next(null);
      return;
    }

    if (this.selectedProject?.id === projectId) {
      return;
    }

    this.loadProject(projectId);
  }

  private tabFromRoute(
    tabParam: string | null,
    hasProject: boolean,
  ): PortfolioTab {
    if (!hasProject) {
      return this.tabs[0];
    }

    const routeTab = this.tabs.find(
      (tab) => tab.routeSegment === tabParam && tab.routeSegment !== 'select',
    );

    return (
      routeTab ??
      this.tabs.find((tab) => tab.routeSegment === 'progress') ??
      this.tabs[0]
    );
  }

  private loadProject(projectId: number): void {
    this.selectedProjectId = projectId;

    this.projectService.loadProject(projectId, this.unit).subscribe({
      next: (project) => {
        if (this.selectedProjectId !== project.id) {
          return;
        }

        this.selectedProject = project;
        this.selectedProject$.next(project);
      },
      error: (error) => {
        this.selectedProjectId = null;
        this.selectedProject = null;
        this.selectedProject$.next(null);
        this.alertService.error(`Failed to load project: ${error}`, 6000);
        console.error(error);
      },
    });
  }

  private navigateToProject(projectId: number, tab: PortfolioTabKey): void {
    this.router.navigate(
      ['/units', this.unit.id, 'students', 'portfolios', projectId, tab],
      {
        replaceUrl: true,
      },
    );
  }
}
