import {HotkeysHelpComponent, HotkeysService} from '@ngneat/hotkeys';
import {MediaObserver} from 'ng-flex-layout';
import {CdkDragEnd, CdkDragMove, CdkDragStart} from '@angular/cdk/drag-drop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Observable, Subject, auditTime, merge, of, takeUntil, tap, withLatestFrom} from 'rxjs';
import {Tutorial} from 'src/app/api/models/doubtfire-model';
import {Task} from 'src/app/api/models/task';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {UnitRole} from 'src/app/api/models/unit-role';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';

interface InboxTaskData {
  source: (
    unit: Unit,
    taskDef?: TaskDefinition | number,
    fetchMyStudentsOnly?: boolean,
  ) => Observable<Task[]> | null;
  selectedTask: Task | null;
  taskKey: unknown;
  onSelectedTaskChange: (task: Task | null) => void;
  taskDefMode: boolean;
}

@Component({
  selector: 'f-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class InboxComponent implements OnInit, OnDestroy {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() taskData: InboxTaskData;
  @Input() loading = false;
  @Input() filters: Partial<{
    taskDefinition: TaskDefinition;
    tutorials: Tutorial[];
    forceStream: boolean;
    studentName: string;
    tutorialIdSelected: string | number;
    taskDefinitionIdSelected: number | TaskDefinition;
  }>;
  @Input() showSearchOptions: boolean;
  @ViewChild('inboxpanel') inboxPanel: ElementRef;
  @ViewChild('commentspanel') commentspanel: ElementRef;

  @Input() viewType: 'inbox' | 'explorer' | 'moderation' | 'overflow';

  subs$: Observable<unknown>;

  private inboxStartSize$: Subject<number> = new Subject();
  private dragMove$: Subject<{event: CdkDragMove; div: HTMLDivElement}> = new Subject();
  private dragMoveAudited$;
  private readonly destroy$: Subject<void> = new Subject();
  private readonly commentsBreakpoint = '(max-width: 999.98px)';

  // protected filters;
  // protected showSearchOptions;

  public taskSelected = false;
  public isCommentsNarrow = false;
  public commentsCollapsed = false;

  visiblePdfUrl: string;

  get narrowTaskInbox(): boolean {
    return this.inboxPanel?.nativeElement.getBoundingClientRect().width < 150;
  }

  get isMobileView(): boolean {
    return this.mediaObserver.isActive('xs');
  }

  get commentsPanelCollapsed(): boolean {
    return this.isCommentsNarrow && this.commentsCollapsed;
  }

  constructor(
    private hotkeys: HotkeysService,
    private selectedTask: SelectedTaskService,
    public mediaObserver: MediaObserver,
    public fileDownloader: FileDownloaderService,
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private constants: DoubtfireConstants,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.selectedTask.currentPdfUrl$.subscribe((url) => {
      this.visiblePdfUrl = url;
    });

    this.selectedTask.selectedTask$.subscribe((task) => {
      this.taskSelected = task != null;
    });
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

    const registeredHotkeys = this.hotkeys.getHotkeys().map((hotkey) => hotkey.keys);

    if (!registeredHotkeys.includes('shift.?')) {
      this.hotkeys.registerHelpModal(() => {
        const ref = this.dialog.open(HotkeysHelpComponent, {
          // width: '250px',
        });
        ref.componentInstance.title = `${this.constants.ExternalName.value} Feedback Shortcuts`;
        ref.componentInstance.dismiss.subscribe(() => ref.close());
      });
    }

    if (!registeredHotkeys.includes('control.shift.f')) {
      this.hotkeys
        .addShortcut({
          keys: 'control.shift.f',
          description: 'Mark selected task as fix',
        })
        .subscribe(() => this.selectedTask.selectedTask?.updateTaskStatus('fix_and_resubmit'));
    }

    if (!registeredHotkeys.includes('control.shift.c')) {
      this.hotkeys
        .addShortcut({
          keys: 'control.Shift.c',
          description: 'Mark selected task as complete',
        })
        .subscribe(() => {
          const task = this.selectedTask.selectedTask;
          if (!task) {
            return;
          }

          if (!task.canMarkComplete) {
            return;
          }

          task.updateTaskStatus('complete');
        });
    }

    if (!registeredHotkeys.includes('control.shift.d')) {
      this.hotkeys
        .addShortcut({
          keys: 'control.shift.d',
          description: 'Mark selected task as discuss',
        })
        .subscribe(() => {
          const task = this.selectedTask.selectedTask;
          task?.updateTaskStatus(task.status === 'discuss' ? 'rediscuss' : 'discuss');
        });
    }

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

  ngOnDestroy(): void {
    document.body.classList.remove('split-pane-resizing');
    this.destroy$.next();
    this.destroy$.complete();
    this.hotkeys.removeShortcuts('control.shift.d');
    this.hotkeys.removeShortcuts('control.shift.f');
    this.hotkeys.removeShortcuts('control.shift.c');
    this.hotkeys.removeShortcuts('shift.?');
  }

  public toggleCommentsPanel(): void {
    this.commentsCollapsed = !this.commentsCollapsed;
    window.dispatchEvent(new Event('resize'));
  }

  startedDragging(event: CdkDragStart, div: HTMLDivElement) {
    document.body.classList.add('split-pane-resizing');
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
    document.body.classList.remove('split-pane-resizing');
    event.source.element.nativeElement.classList.remove('hovering');
  }

  goToStudent(): void {
    // this.router.navigateByUrl('projects/dashboard', {
    //   projectId: this.taskData.selectedTask.project.id,
    //   tutor: true,
    //   taskAbbr: '',
    // });
    this.router.navigate(['/projects', this.taskData.selectedTask.project.id, 'dashboard']);
  }

  openPdfInNewTab(): void {
    if (!this.visiblePdfUrl || !this.taskData?.selectedTask) {
      return;
    }

    const task = this.taskData.selectedTask;
    const taskSheetUrl = task.definition.getTaskPDFUrl();
    const fileName =
      this.visiblePdfUrl === taskSheetUrl
        ? `${task.definition.abbreviation}-task-sheet.pdf`
        : `${task.definition.abbreviation}.pdf`;

    this.fileDownloader.downloadFile(this.visiblePdfUrl, fileName);
  }
}
