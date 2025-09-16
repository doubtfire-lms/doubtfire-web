import {CdkDragEnd, CdkDragStart, CdkDragMove} from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MediaObserver} from 'ng-flex-layout';
import {UIRouter} from '@uirouter/angular';
import {auditTime, merge, Observable, of, Subject, tap, withLatestFrom} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {Unit} from 'src/app/api/models/unit';
import {UnitRole} from 'src/app/api/models/unit-role';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
import {HotkeysService, HotkeysHelpComponent} from '@ngneat/hotkeys';
import {MatDialog} from '@angular/material/dialog';
import {UserService} from 'src/app/api/services/user.service';

@Component({
  selector: 'f-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent implements OnInit, AfterViewInit {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() taskData: {selectedTask: Task; any};

  @ViewChild('inboxpanel') inboxPanel: ElementRef;
  @ViewChild('commentspanel') commentspanel: ElementRef;

  subs$: Observable<unknown>;

  private inboxStartSize$ = new Subject<number>();
  private dragMove$ = new Subject<{event: CdkDragMove; div: HTMLDivElement}>();
  private dragMoveAudited$;

  protected filters;
  protected showSearchOptions;

  public taskSelected = false;

  visiblePdfUrl: string;

  get narrowTaskInbox(): boolean {
    return this.inboxPanel?.nativeElement.getBoundingClientRect().width < 150;
  }

  constructor(
    private hotkeys: HotkeysService,
    private selectedTask: SelectedTaskService,
    public mediaObserver: MediaObserver,
    public fileDownloader: FileDownloaderService,
    private router: UIRouter,
    public dialog: MatDialog,
    private userService: UserService,
  ) {
    this.selectedTask.currentPdfUrl$.subscribe((url) => {
      this.visiblePdfUrl = url;
    });

    this.selectedTask.selectedTask$.subscribe((task) => {
      this.taskSelected = task != null;
    });
  }
  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    const markers = ['Admin', 'Convenor', 'Tutor', 'Student'];

    if (markers.includes(this.userService.currentUser?.role)) {
      this.hotkeys.registerHelpModal(() => {
        const ref = this.dialog.open(HotkeysHelpComponent, {
          // width: '250px',
        });
        ref.componentInstance.title = 'Formatif Marking Shortcuts';
        ref.componentInstance.dismiss.subscribe(() => ref.close());
      });
    }
  }

  ngOnInit(): void {
    // this.hotkeys
    //   .addShortcut({
    //     keys: 'control.c',
    //     description: 'Mark selected task as complete',
    //   })
    //   .subscribe(() => this.selectedTask.selectedTask?.updateTaskStatus('complete'));

    // this.hotkeys
    //   .addShortcut({
    //     keys: 'control.f',
    //     description: 'Mark selected task as fix',
    //   })
    //   .subscribe(() => this.selectedTask.selectedTask?.updateTaskStatus('fix_and_resubmit'));

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
      }),
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
    this.dragMove$.next({event, div});
    event.source.reset();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stoppedDragging(event: CdkDragEnd, _div: HTMLDivElement) {
    event.source.element.nativeElement.classList.remove('hovering');
  }

  goToStudent(): void {
    this.router.stateService.go('projects/dashboard', {
      projectId: this.taskData.selectedTask.project.id,
      tutor: true,
      taskAbbr: '',
    });
  }

  openPdfInNewTab(): void {
    if (this.taskData.selectedTask.hasPdf) {
      this.fileDownloader.downloadFile(
        this.visiblePdfUrl,
        `${this.taskData.selectedTask.definition.abbreviation}.pdf`,
      );
    }
  }
}
