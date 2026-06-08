/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BehaviorSubject,
  Observable,
  Subject,
  auditTime,
  first,
  merge,
  of,
  tap,
  withLatestFrom,
} from 'rxjs';
import {Project, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {ProjectService} from 'src/app/api/services/project.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {UserService} from 'src/app/api/services/user.service';
import {CdkDragEnd, CdkDragMove, CdkDragStart} from '@angular/cdk/drag-drop';
import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GlobalStateService, ViewType} from '../../index/global-state.service';

@Component({
  selector: 'f-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss',
  standalone: false,
})
export class ProjectDashboardComponent implements OnInit {
  @Input() public project$: Observable<Project>;

  /**
   * The currently selected task definition - selected in the unit task list.
   * This is crated here, and passed to children to interact with and share across context.
   */
  public selectedTaskDefinition$: BehaviorSubject<TaskDefinition> =
    new BehaviorSubject<TaskDefinition>(null);

  subs$: Observable<unknown>;
  readonly skeletonRows = Array.from({length: 10}, (_, index) => index);
  private readonly projectSubject: BehaviorSubject<Project> = new BehaviorSubject(null);

  private leftComponentStartSize$: Subject<number> = new Subject();
  private dragMove$: Subject<{event: CdkDragMove; div: HTMLDivElement}> = new Subject();
  private dragMoveAudited$;
  private projectReady = false;

  projectTasks = [];

  constructor(
    private currentUser: UserService,
    private projectService: ProjectService,
    private unitService: UnitService,
    private globalStateService: GlobalStateService,
    private route: ActivatedRoute,
  ) {}

  public leftWidth = 400;
  public lastX;
  public startWidth = 0;

  public startLeftX = 0;

  public isProjectTaskListReady(project: Project): boolean {
    return (
      this.projectReady &&
      !!project?.id &&
      !!project.unit?.id &&
      project.targetGrade !== undefined &&
      project.targetGrade !== null
    );
  }

  public taskDefinitionsForProject(project: Project): TaskDefinition[] {
    if (!this.isProjectTaskListReady(project)) {
      return [];
    }

    return project.unit.taskDefinitionsForGrade(project.targetGrade);
  }

  startedDragging(event: CdkDragStart, boundary: HTMLElement) {
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

    this.leftWidth = Math.max(150, Math.min(500, newWidth));

    // keep the handle visually glued to the divider
    event.source.reset();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stoppedDragging(event: CdkDragEnd, _div: HTMLDivElement) {
    event.source.element.nativeElement.classList.remove('hovering');
  }

  ngOnInit(): void {
    const initialProject$ =
      this.project$ ?? of(this.route.parent?.snapshot.data.project as Project);
    this.project$ = this.projectSubject.asObservable();
    initialProject$.pipe(first()).subscribe((project) => {
      this.projectSubject.next(project);
      this.loadProject(
        project?.id ?? Number(this.route.parent?.snapshot.paramMap.get('projectId')),
      );
    });

    this.dragMoveAudited$ = this.dragMove$.pipe(
      withLatestFrom(this.leftComponentStartSize$),
      auditTime(30),
      tap(([moveEvent, startSize]) => {
        window.dispatchEvent(new Event('resize'));

        let newWidth: number;
        let width: number;
        if (moveEvent.div.id === 'inboxpanel') {
          newWidth = startSize + moveEvent.event.distance.x;

          // if width is belo 250, snap to 50px
          if (newWidth < 250 && newWidth > 100) {
            width = 250;
          } else if (newWidth < 150) {
            width = 50;
          } else {
            width = Math.min(newWidth, 500);
          }
        } else {
          newWidth = startSize - moveEvent.event.distance.x;
          width = Math.min(Math.max(newWidth, 250), 500);
        }
        moveEvent.div.style.width = `${width}px`;
        moveEvent.event.source.reset();
      }),
    );
    this.subs$ = merge(this.dragMoveAudited$, of(true));
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
