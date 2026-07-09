/* eslint-disable @typescript-eslint/no-explicit-any */
import {CdkDragEnd, CdkDragMove, CdkDragStart} from '@angular/cdk/drag-drop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject, Observable, Subject, first, of, takeUntil} from 'rxjs';
import {Project, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {ProjectService} from 'src/app/api/services/project.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {UserService} from 'src/app/api/services/user.service';
import {GlobalStateService, ViewType} from '../../index/global-state.service';

@Component({
  selector: 'f-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectDashboardComponent implements OnInit, OnDestroy {
  @Input() public project$: Observable<Project>;
  @Input() public defaultTaskListCollapsed = false;
  @Input() public taskSelectionUrlBase: unknown[] | null = null;
  @Input() public showSubmittedGrade?: boolean = false;
  @Input() public set taskListWidth(width: number | undefined) {
    if (typeof width === 'number') {
      this._leftWidth = width;
    }
  }

  @Output() public taskListWidthChange: EventEmitter<number> = new EventEmitter();

  /**
   * The currently selected task definition - selected in the unit task list.
   * This is crated here, and passed to children to interact with and share across context.
   */
  public selectedTaskDefinition$: BehaviorSubject<TaskDefinition> =
    new BehaviorSubject<TaskDefinition>(null);

  subs$: Observable<unknown> = of(true);
  readonly skeletonRows = Array.from({length: 10}, (_, index) => index);
  private readonly projectSubject: BehaviorSubject<Project> = new BehaviorSubject(null);

  private readonly destroy$: Subject<void> = new Subject();
  private projectReady = false;

  projectTasks = [];

  constructor(
    private currentUser: UserService,
    private projectService: ProjectService,
    private unitService: UnitService,
    private globalStateService: GlobalStateService,
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
  ) {}

  public readonly taskListCollapsedWidth = 75;
  public readonly taskListExpandedWidth = 400;
  public readonly taskListCollapseThreshold = 125;
  private _leftWidth = this.taskListExpandedWidth;
  public lastX;
  public startWidth = 0;

  public startLeftX = 0;
  public isCommentsNarrow = false;
  public commentsCollapsed = false;

  private readonly commentsBreakpoint = '(max-width: 999.98px)';

  public get commentsPanelCollapsed(): boolean {
    return this.isCommentsNarrow && this.commentsCollapsed;
  }

  public get taskListCollapsed(): boolean {
    return this.leftWidth < this.taskListCollapseThreshold;
  }

  public get leftWidth(): number {
    return this._leftWidth;
  }

  public set leftWidth(width: number) {
    this._leftWidth = width;
    this.taskListWidthChange.emit(width);
  }

  public isProjectTaskListReady(project: Project): boolean {
    return (
      this.projectReady &&
      !!project?.id &&
      !!project.unit?.id &&
      project.targetGrade !== undefined &&
      project.targetGrade !== null
    );
  }

  public taskDefinitionsForProject(project: Project): readonly TaskDefinition[] {
    if (!this.isProjectTaskListReady(project)) {
      return [];
    }

    return project.unit.taskDefinitions;
  }

  startedDragging(event: CdkDragStart, boundary: HTMLElement) {
    document.body.classList.add('split-pane-resizing');
    event.source.element.nativeElement.classList.add('hovering');
    const rect = boundary.getBoundingClientRect();
    // x relative to the container
    this.startLeftX = (event.event as MouseEvent).clientX - rect.left;
    this.startWidth = this.leftWidth;
  }

  dragging(event: CdkDragMove, boundary: HTMLElement) {
    const rect = boundary.getBoundingClientRect();
    const x = (event.event as MouseEvent).clientX - rect.left;

    const delta = x - this.startLeftX;
    const newWidth = this.startWidth + delta;

    this.leftWidth = Math.max(this.taskListCollapsedWidth, Math.min(500, newWidth));

    // keep the handle visually glued to the divider
    event.source.reset();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stoppedDragging(event: CdkDragEnd, _div: HTMLDivElement) {
    document.body.classList.remove('split-pane-resizing');
    event.source.element.nativeElement.classList.remove('hovering');
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe(this.commentsBreakpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({matches}) => {
        this.isCommentsNarrow = matches;
        this.commentsCollapsed = matches;
        window.dispatchEvent(new Event('resize'));
      });

    if (this.defaultTaskListCollapsed) {
      this.leftWidth = this.taskListCollapsedWidth;
    }

    const initialProject$ =
      this.project$ ?? of(this.route.parent?.snapshot.data.project as Project);
    this.project$ = this.projectSubject.asObservable();
    initialProject$.pipe(first()).subscribe((project) => {
      this.projectSubject.next(project);
      this.loadProject(
        project?.id ?? Number(this.route.parent?.snapshot.paramMap.get('projectId')),
      );
    });

    window.dispatchEvent(new Event('resize'));
  }

  ngOnDestroy(): void {
    document.body.classList.remove('split-pane-resizing');
    this.destroy$.next();
    this.destroy$.complete();
  }

  public toggleCommentsPanel(): void {
    this.commentsCollapsed = !this.commentsCollapsed;
    window.dispatchEvent(new Event('resize'));
  }

  private loadProject(projectId: number): void {
    if (!projectId) {
      return;
    }

    this.projectService
      .get(
        {id: projectId},
        {
          cacheBehaviourOnGet: 'cacheQuery',
          mappingCompleteCallback: (project: Project) => this.loadUnit(project),
        },
      )
      .subscribe();
  }

  private loadUnit(project: Project): void {
    const unitId = project.unit?.id;
    if (!unitId) {
      this.showLoadedProject(project);
      return;
    }

    this.unitService.get(unitId).subscribe({
      next: (unit) => {
        project.unit = unit;
        unit.studentCache.add(project);
        this.showLoadedProject(project);
      },
      error: () => {
        this.showLoadedProject(project);
      },
    });
  }

  private showLoadedProject(project: Project): void {
    this.projectReady = true;
    this.globalStateService.setView(ViewType.PROJECT, project);
    this.projectSubject.next(project);
  }
}
