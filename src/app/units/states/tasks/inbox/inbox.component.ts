import { CdkDragEnd, CdkDragStart, CdkDragMove } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { StateService, UIRouter } from '@uirouter/core';
import { auditTime, merge, Observable, of, Subject, tap, withLatestFrom } from 'rxjs';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';

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

  constructor(private router: UIRouter, private state: StateService) {}

  @Output() resized = new EventEmitter<number>();

  ngOnInit(): void {
    this.dragMoveAudited$ = this.dragMove$.pipe(
      withLatestFrom(this.inboxStartSize$),
      auditTime(30),
      tap(([moveEvent, startSize]) => {
        let newWidth: number;
        let width: number;
        if (moveEvent.div.id === 'inboxpanel') {
          newWidth = startSize + moveEvent.event.distance.x;
          width = Math.min(Math.max(newWidth, 250), 500);
        } else {
          newWidth = startSize - moveEvent.event.distance.x;
          width = Math.min(Math.max(newWidth, 250), 500);
        }

        moveEvent.div.style.width = `${width}px`;
        moveEvent.event.source.reset();
      })
    );
    this.subs$ = merge(this.dragMoveAudited$, of(true));
  }

  startedDragging(event: CdkDragStart, div: HTMLDivElement) {
    const w = div.getBoundingClientRect().width;
    this.inboxStartSize$.next(w);
  }

  dragging(event: CdkDragMove, div: HTMLDivElement) {
    this.dragMove$.next({ event, div });
    event.source.reset();
  }

  stoppedDragging(event: CdkDragEnd, div: HTMLDivElement) {
    const w = div.getBoundingClientRect().width;
    console.log('stopped dragging: ' + w);
    this.resized.emit(w);
  }
}
