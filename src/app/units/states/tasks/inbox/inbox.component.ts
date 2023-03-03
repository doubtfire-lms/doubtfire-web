import { CdkDragEnd, CdkDragStart, CdkDragMove } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { auditTime, merge, Observable, of, Subject, tap, withLatestFrom } from 'rxjs';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';
import { SelectedTaskService } from 'src/app/projects/states/dashboard/selected-task.service';

@Component({
  selector: 'f-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent implements OnInit {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() taskData: any;

  @ViewChild('inboxpanel') inboxPanel: ElementRef;
  @ViewChild('commentspanel') commentspanel: ElementRef;

  subs$: Observable<any>;

  private inboxStartSize$ = new Subject<number>();
  private dragMove$ = new Subject<{ event: CdkDragMove; div: HTMLDivElement }>();
  private dragMoveAudited$;

  public taskSelected = false;

  visiblePdfUrl: string;

  get narrowTaskInbox(): boolean {
    return this.inboxPanel?.nativeElement.getBoundingClientRect().width < 150;
  }

  constructor(private selectedTask: SelectedTaskService, public mediaObserver: MediaObserver) {
    this.selectedTask.currentPdfUrl$.subscribe((url) => {
      this.visiblePdfUrl = url;
    });

    this.selectedTask.selectedTask$.subscribe((task) => {
      this.taskSelected = task != null;
    });
  }

  ngOnInit(): void {
    this.dragMoveAudited$ = this.dragMove$.pipe(
      withLatestFrom(this.inboxStartSize$),
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
