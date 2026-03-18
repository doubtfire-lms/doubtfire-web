/* eslint-disable @typescript-eslint/no-explicit-any */
import {CdkDragEnd, CdkDragMove, CdkDragStart} from '@angular/cdk/drag-drop';
import {Component, Input, OnInit} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  auditTime,
  merge,
  of,
  tap,
  withLatestFrom,
} from 'rxjs';
import {ProjectService} from 'src/app/api/services/project.service';
import {GlobalStateService, ViewType} from '../../index/global-state.service';
import {UserService} from 'src/app/api/services/user.service';
import {Project, TaskDefinition} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss',
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

  private leftComponentStartSize$ = new Subject<number>();
  private dragMove$ = new Subject<{event: CdkDragMove; div: HTMLDivElement}>();
  private dragMoveAudited$;

  projectTasks = [];

  constructor(
    private currentUser: UserService,
    private projectService: ProjectService,
    private globalStateService: GlobalStateService,
  ) {}

  public leftWidth = 400;
  public lastX;
  public startWidth = 0;

  public startLeftX = 0;

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
    // projectTasks = this.projectService.loadProject
    this.project$.subscribe((project) => {
      console.log(project);
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
}
