import { CdkDragEnd, CdkDragStart, CdkDragMove } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { auditTime, merge, Observable, of, Subject, tap, withLatestFrom } from 'rxjs';
import { TasksViewerService } from '../tasks-viewer.service';

@Component({
  selector: 'f-tasks-viewer',
  templateUrl: './tasks-viewer.component.html',
  styleUrls: ['./tasks-viewer.component.scss']
})
export class TasksViewerComponent implements OnInit {

  @Input() taskDefs: TaskDefinition[];
  selectedTaskDef: TaskDefinition;

  subs$: Observable<any>;

  private inboxStartSize$ = new Subject<number>();
  private dragMove$ = new Subject<{ event: CdkDragMove; div: HTMLDivElement }>();
  private dragMoveAudited$;

  constructor(
    private taskViewerService: TasksViewerService
  ) {}

  ngOnInit() {
    console.log(this.taskDefs);

    this.taskViewerService.selectedTaskDef.subscribe((taskDef) => {
      this.selectedTaskDef = taskDef;
    });

    this.dragMoveAudited$ = this.dragMove$.pipe(
      withLatestFrom(this.inboxStartSize$),
      auditTime(30),
      tap(([moveEvent, startSize]) => {
        window.dispatchEvent(new Event('resize'));

        let newWidth: number;
        let width: number;
        if (moveEvent.div.id === 'tasklistpanel') {
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
      })
    );
    this.subs$ = merge(this.dragMoveAudited$, of(true));
    window.dispatchEvent(new Event('resize'));

  }

  startedDragging(event: CdkDragStart, div: HTMLDivElement) {
    event.source.element.nativeElement.classList.add('hovering');
    const w = div.getBoundingClientRect().width;
    this.inboxStartSize$.next(w);
  }

  dragging(event: CdkDragMove, div: HTMLDivElement) {
    this.dragMove$.next({ event, div });
    event.source.reset();
  }

  stoppedDragging(event: CdkDragEnd, div: HTMLDivElement) {
    event.source.element.nativeElement.classList.remove('hovering');
  }
}
