import { CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { UIRouter } from '@uirouter/core';
import { Observable, Subject, auditTime, merge, of, tap, withLatestFrom } from 'rxjs';
import { FileDownloaderService } from '../../file-downloader/file-downloader';

@Component({
  selector: 'f-triple-panel-layout',
  templateUrl: './triple-panel-layout.component.html',
  styleUrls: ['./triple-panel-layout.component.scss'],
})
export class TriplePanelLayoutComponent implements OnInit {
  @ViewChild('leftPanel') leftPanel: ElementRef;
  @ViewChild('rightPanel') rightPanel: ElementRef;

  @Input() showCenter = false;

  subs$: Observable<any>;

  private leftPanelStartSize$ = new Subject<number>();
  private dragMove$ = new Subject<{ event: CdkDragMove; div: HTMLDivElement }>();
  private dragMoveAudited$;

  get narrowLeftPanel(): boolean {
    return this.leftPanel?.nativeElement.getBoundingClientRect().width < 150;
  }

  constructor(
    public mediaObserver: MediaObserver,
    public fileDownloader: FileDownloaderService,
    private router: UIRouter
  ) {
    // this.selectedTask.currentPdfUrl$.subscribe((url) => {
    //   this.visiblePdfUrl = url;
    // });
    // this.selectedTask.selectedTask$.subscribe((task) => {
    //   this.taskSelected = task != null;
    // });
  }

  ngOnInit(): void {
    this.dragMoveAudited$ = this.dragMove$.pipe(
      withLatestFrom(this.leftPanelStartSize$),
      auditTime(30),
      tap(([moveEvent, startSize]) => {
        window.dispatchEvent(new Event('resize'));

        let newWidth: number;
        let width: number;
        if (moveEvent.div.id === 'leftPanel') {
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
    this.leftPanelStartSize$.next(w);
  }

  dragging(event: CdkDragMove, div: HTMLDivElement) {
    this.dragMove$.next({ event, div });
    event.source.reset();
  }

  stoppedDragging(event: CdkDragEnd, div: HTMLDivElement) {
    event.source.element.nativeElement.classList.remove('hovering');
  }
}
