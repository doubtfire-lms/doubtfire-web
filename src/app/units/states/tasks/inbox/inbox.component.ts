import { CdkDragEnd, CdkDragStart, CdkDragMove } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { StateService, UIRouter } from '@uirouter/core';
import { mouse } from 'd3';
import { auditTime, interval, merge, Observable, of, pipe, Subject, switchMap, tap, withLatestFrom } from 'rxjs';
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
  // leftPanelWidth = 300;
  // rightPanelWidth = 300;

  // private _minPanelWidth = 150;
  // private _maxPanelWidth = 500;

  // private resized$ = new Subject<number>();
  private startSize$ = new Subject<number>();
  private dragMove$ = new Subject<CdkDragMove>();
  private leftPanelWidth$ = new Subject<number>();
  subs$: Observable<any>;
  private dragMoveAudited$;

  constructor(private router: UIRouter, private state: StateService) {}

  @Output() resized = new EventEmitter<number>();

  ngOnInit(): void {
    this.dragMoveAudited$ = this.dragMove$.pipe(
      withLatestFrom(this.startSize$),
      auditTime(30),
      tap(([moveEvent, startSize]) => {
        this.inboxPanel.nativeElement.style.width = `${startSize + moveEvent.distance.x}px`;
        moveEvent.source.reset();
      })
    );
    this.subs$ = merge(this.dragMoveAudited$, of(true));
  }

  stoppedDragging(event: CdkDragEnd, div: HTMLDivElement) {
    return;
    // resizing left panel
    // if (div.id === 'leftResizerEl') {
    //   const newWidth = this.leftPanelWidth + event.distance.x;
    //   if (newWidth <= this._minPanelWidth) {
    //     this.leftPanelWidth = this._minPanelWidth;
    //   } else if (newWidth >= this._maxPanelWidth) {
    //     this.leftPanelWidth = this._maxPanelWidth;
    //   } else {
    //     this.leftPanelWidth = newWidth;
    //   }
    // }
    // // Moving the right panel
    // else {
    //   const newWidth = this.rightPanelWidth - event.distance.x;
    //   if (newWidth <= this._minPanelWidth) {
    //     this.rightPanelWidth = this._minPanelWidth;
    //   } else if (newWidth >= this._maxPanelWidth) {
    //     this.rightPanelWidth = this._maxPanelWidth;
    //   } else {
    //     this.rightPanelWidth = newWidth;
    //   }
    // }

    // event.source.reset();
  }

  startedDragging(event: CdkDragStart, div: HTMLDivElement) {
    const w = this.inboxPanel.nativeElement.getBoundingClientRect().width;
    this.startSize$.next(w);
  }

  dragging(event: CdkDragMove, div: HTMLDivElement) {
    this.dragMove$.next(event);
    event.source.reset();
  }

  stoppedDraggin(event: CdkDragEnd, div: HTMLDivElement) {
    const w = this.inboxPanel.nativeElement.getBoundingClientRect().width;
    console.log('stopped dragging: ' + w);
    this.resized.emit(w);
  }
}
