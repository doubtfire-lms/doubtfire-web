import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {BehaviorSubject, Observable, Subscription, first, of} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {
  DEFAULT_PORTFOLIO_LIST_FILTERS,
  PortfolioListFilters,
} from './directives/portfolios-list/portfolios-list.component';

type PortfolioTabKey = 'select' | 'progress' | 'student-notes' | 'portfolio' | 'assessment';

interface PortfolioTab {
  label: string;
  routeSegment: PortfolioTabKey;
  requiresProject: boolean;
}

@Component({
  selector: 'f-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrl: './portfolios.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfoliosComponent implements OnInit, OnDestroy {
  @Input() unit$: Observable<Unit>;

  public readonly tabs: PortfolioTab[] = [
    {label: 'Select Student', routeSegment: 'select', requiresProject: false},
    {label: 'View Progress', routeSegment: 'progress', requiresProject: true},
    {label: 'View Student Notes', routeSegment: 'student-notes', requiresProject: true},
    {label: 'View Portfolio', routeSegment: 'portfolio', requiresProject: true},
    {label: 'Assess Portfolio', routeSegment: 'assessment', requiresProject: true},
  ];

  public unit: Unit = null;
  public selectedProject: Project | null = null;
  public selectedProject$: BehaviorSubject<Project | null> = new BehaviorSubject(null);
  public loadingStudents = true;
  public currentTab: PortfolioTab = this.tabs[0];
  public portfolioListFilters: PortfolioListFilters = {...DEFAULT_PORTFOLIO_LIST_FILTERS};

  private subscriptions: Subscription[] = [];
  private selectedProjectId: number | null = null;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private userService: UserService,
  ) {}

  public ngOnInit(): void {
    this.unit$ = this.unit$ ?? of(this.route.parent.snapshot.data.unit);
    this.subscriptions.push(
      this.unit$.pipe(first()).subscribe({
        next: (unit) => {
          this.unit = unit;

          if (
            this.userService.currentUser.systemRole === 'Admin' ||
            this.userService.currentUser.systemRole === 'Convenor'
          ) {
            this.unit.loadD2lMapping().subscribe();
          }

          this.loadStudents();
          this.subscriptions.push(
            this.route.paramMap.subscribe((params) => {
              this.updateCurrentTabFromState(params.get('tab'), params.get('projectId'));
            }),
            this.route.queryParamMap.subscribe((params) => {
              this.updatePortfolioListFiltersFromQueryParams(params);
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
    const index = this.tabs.findIndex((tab) => tab.routeSegment === this.currentTab.routeSegment);
    return index >= 0 ? index : 0;
  }

  public get progressTaskSelectionUrlBase(): unknown[] | null {
    if (!this.unit || !this.selectedProject) {
      return null;
    }

    return ['/units', this.unit.id, 'students', 'portfolios', this.selectedProject.id, 'progress'];
  }

  public studentSelected(project: Project): void {
    this.navigateToProject(project.id, 'progress');
  }

  public portfolioListFiltersChange(filters: PortfolioListFilters): void {
    this.portfolioListFilters = {...filters};

    if (this.currentTab.routeSegment === 'select') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: this.portfolioListFilterQueryParams(),
        replaceUrl: true,
      });
    }
  }

  public onTabChange(event: MatTabChangeEvent): void {
    const nextTab = this.tabs[event.index] ?? this.tabs[0];
    this.currentTab = nextTab;

    if (nextTab.routeSegment === 'select' || !this.selectedProject) {
      this.router.navigate(['/units', this.unit.id, 'students', 'portfolios'], {
        queryParams: this.portfolioListFilterQueryParams(),
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

  private updatePortfolioListFiltersFromQueryParams(params: ParamMap): void {
    const filters: PortfolioListFilters = {
      portfolioFilter: params.get('portfolio') === 'all' ? 'all' : 'submitted_only',
      tutorialFilter: params.get('tutorial') === 'mine' ? 'mine' : 'all',
      gradeFilter: this.gradeFilterFromQueryParam(params.get('grade')),
      filterText: params.get('search') ?? '',
    };

    if (!this.portfolioListFiltersEqual(filters, this.portfolioListFilters)) {
      this.portfolioListFilters = filters;
    }
  }

  private gradeFilterFromQueryParam(grade: string | null): number | null {
    if (grade === null) {
      return null;
    }

    const gradeValue = Number(grade);
    return Number.isFinite(gradeValue) ? gradeValue : null;
  }

  private portfolioListFilterQueryParams(): Record<string, string | number | null> {
    return {
      portfolio:
        this.portfolioListFilters.portfolioFilter === DEFAULT_PORTFOLIO_LIST_FILTERS.portfolioFilter
          ? null
          : this.portfolioListFilters.portfolioFilter,
      tutorial:
        this.portfolioListFilters.tutorialFilter === DEFAULT_PORTFOLIO_LIST_FILTERS.tutorialFilter
          ? null
          : this.portfolioListFilters.tutorialFilter,
      grade: this.portfolioListFilters.gradeFilter,
      search: this.portfolioListFilters.filterText.trim() || null,
    };
  }

  private portfolioListFiltersEqual(a: PortfolioListFilters, b: PortfolioListFilters): boolean {
    return (
      a.portfolioFilter === b.portfolioFilter &&
      a.tutorialFilter === b.tutorialFilter &&
      a.gradeFilter === b.gradeFilter &&
      a.filterText === b.filterText
    );
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

  private tabFromRoute(tabParam: string | null, hasProject: boolean): PortfolioTab {
    if (!hasProject) {
      return this.tabs[0];
    }

    const routeTab = this.tabs.find(
      (tab) => tab.routeSegment === tabParam && tab.routeSegment !== 'select',
    );

    return routeTab ?? this.tabs.find((tab) => tab.routeSegment === 'progress') ?? this.tabs[0];
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
    this.router.navigate(['/units', this.unit.id, 'students', 'portfolios', projectId, tab], {
      queryParams: this.portfolioListFilterQueryParams(),
      replaceUrl: true,
    });
  }
}
