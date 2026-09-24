import {CameraDevice, Html5Qrcode, Html5QrcodeScannerState} from 'html5-qrcode';
import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSelectionList} from '@angular/material/list';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AuthenticationService,
  DiscussionTaskStatusUpdate,
  EngagementService,
  Project,
  ProjectService,
  Task,
  TaskCommentService,
  TaskDefinition,
  TaskService,
  TaskStatusEnum,
  TutorialStream,
  Unit,
  UnitService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {DiscussedInClassReasonModalService} from 'src/app/common/modals/discussed-in-class-reason-modal/discussed-in-class-reason-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {AddEngagementDialogComponent} from '../dashboard/directives/progress-dashboard/engagement-passport-card/add-engagement-dialog/add-engagement-dialog.component';

enum TutorDiscussionTabView {
  SHOW_COMMENTS,
  SHOW_STAFF_NOTES,
  SHOW_DISCUSSION_PROMPTS,
}
@Component({
  selector: 'f-tutor-discussion',
  templateUrl: './tutor-discussion.component.html',
  styleUrl: './tutor-discussion.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TutorDiscussionComponent implements AfterViewInit, OnDestroy {
  private readonly discussedInClassNotePrefix = `I'm manually marking this discussed in class because...`;
  private readonly mobileDiscussionViewportContent =
    'width=device-width, initial-scale=0.8, maximum-scale=5';
  private readonly rememberedCameraKey = 'f-tutor-discussion-camera-id';
  // iOS labels its rear camera "Back Camera", Android uses "camera2 0, facing back"
  private readonly rearCameraLabelPattern = /\b(back|rear|environment)\b/i;

  @Input() unitId: number;
  @Input() username: string;
  @Input() attendance: boolean;

  @ViewChild('tasks') tasksList: MatSelectionList;
  selectedTaskDefinition: TaskDefinition | null = null;

  public filteredTasks: Task[] = [];
  public allTasks: Task[] = [];

  public unit: Unit | null;
  public project: Project | null;

  public selectedTask: Task | null;
  public allowHover = true;
  public isNarrow = false;

  public scanningQr: boolean = false;
  public loadingStudentData: boolean = false;

  public availableCameras: CameraDevice[] = [];
  public selectedCameraId: string | null = null;
  public showCameraPicker: boolean = false;
  public switchingCamera: boolean = false;

  private html5Qrcode?: Html5Qrcode;
  private originalViewportContent: string | null = null;
  private mobileDiscussionZoomApplied = false;

  private _unitId: number;
  private _username: string;

  public TutorDiscussionTabView = TutorDiscussionTabView;
  public footerTabView: TutorDiscussionTabView = TutorDiscussionTabView.SHOW_COMMENTS;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private unitService: UnitService,
    private authService: AuthenticationService,
    private userService: UserService,
    private projectService: ProjectService,
    private gradeService: GradeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private confirmationModalService: ConfirmationModalService,
    private discussedInClassReasonModal: DiscussedInClassReasonModalService,
    private taskCommentService: TaskCommentService,
    private taskService: TaskService,
    private engagementService: EngagementService,
    private dialog: MatDialog,
  ) {}

  public ngOnDestroy(): void {
    this.stopQrScanner();
    this.restoreViewportZoom();
  }

  public currentUserTutorsInStream(tutorialStream: TutorialStream): boolean {
    const user = this.userService.currentUser;
    const tutorials = this.unit.tutorials.filter(
      (t) =>
        t.tutorialStream.abbreviation === tutorialStream.abbreviation &&
        t.tutorialStream.name === tutorialStream.name,
    );
    if (tutorials.some((t) => t.tutor.id === user.id)) {
      return true;
    }
    return false;
  }

  onTabChange(event: MatTabChangeEvent): void {
    if (event.index === 0) {
      this.showComments();
    } else if (event.index === 1) {
      this.showStaffNotes();
    } else if (event.index === 2) {
      this.showDiscussionPrompts();
    }
  }

  public showComments() {
    this.footerTabView = TutorDiscussionTabView.SHOW_COMMENTS;
  }

  public showStaffNotes() {
    this.footerTabView = TutorDiscussionTabView.SHOW_STAFF_NOTES;
  }

  public showDiscussionPrompts() {
    this.footerTabView = TutorDiscussionTabView.SHOW_DISCUSSION_PROMPTS;
  }

  public ngAfterViewInit(): void {
    this.unitId =
      this.unitId ??
      Number(
        this.activatedRoute.parent?.snapshot.paramMap.get('unitId') ??
          this.activatedRoute.snapshot.queryParamMap.get('unitId'),
      );
    this.username = this.username ?? this.activatedRoute.snapshot.queryParamMap.get('username');
    this.attendance =
      this.attendance ??
      this.activatedRoute.snapshot.data.attendance ??
      this.activatedRoute.snapshot.queryParamMap.get('attendance') === 'true';

    this.authService.afterAuthCall((result) => {
      if (!result) {
        return this.router.navigateByUrl('/sign_in');
      } else {
        if (this.userService.currentUser.systemRole === 'Student') {
          // Avoid prompting students for camera permissions before redirecting to unauthorised state
          return;
        }
        if (this.unitId) {
          this._unitId = Number(this.unitId);
          if (!this.attendance) {
            // Tutor discussion view
            if (this.username) {
              this._username = this.username;
              this.getStudentTasks();
            } else {
              setTimeout(() => this.scanQrCode());
            }
          } else {
            this.getUnit().then((u) => {
              this.unit = u;
            });
          }
        }
      }
    });
  }

  private decodeQrCode(data: string) {
    if (!this.scanningQr || this.loadingStudentData) {
      return;
    }

    try {
      const params = new URL(data).searchParams;
      const unitId = parseInt(params.get('unitId'));
      const projectId = parseInt(params.get('projectId'));
      const username = params.get('username');

      if ((!isNaN(unitId) && !isNaN(projectId)) || username) {
        if (unitId) {
          this._unitId = unitId;
        }
        if (username) {
          this._username = username;
        }

        this.changeProject();
      }
    } catch {
      // QR code data is invalid
    }
  }

  public closeQrReader(): void {
    if (!this.project) {
      // Exiting the route entirely
      this.stopQrScanner();
      if (this.unitId) {
        this.router.navigate(['/units', this.unitId, 'tasks', 'inbox']);
      } else {
        this.router.navigateByUrl('/home');
      }
    } else {
      // Close the camera view
      this.scanningQr = false;
      this.showCameraPicker = false;
      this.stopQrScanner();
    }
  }

  private changeProject() {
    this.pauseScanner();
    this.loadingStudentData = true;
    setTimeout(() => {
      try {
        this.getStudentTasks(true);
      } catch (_e) {
        this.alertService.error(`Invalid QR code`, 2000);
        this.loadingStudentData = false;

        setTimeout(() => {
          this.resumeScanner();
        }, 2000);
      }
    });
  }

  private applyMobileDiscussionZoom(): void {
    if (!window.matchMedia('(max-width: 768px)').matches) {
      return;
    }

    const viewport = this.document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!viewport) {
      return;
    }

    this.originalViewportContent ??= viewport.getAttribute('content');
    viewport.setAttribute('content', this.mobileDiscussionViewportContent);
    this.mobileDiscussionZoomApplied = true;
  }

  private restoreViewportZoom(): void {
    if (!this.mobileDiscussionZoomApplied) {
      return;
    }

    const viewport = this.document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (viewport && this.originalViewportContent) {
      viewport.setAttribute('content', this.originalViewportContent);
    }

    this.mobileDiscussionZoomApplied = false;
  }

  private pauseScanner(): void {
    if (this.html5Qrcode?.getState() === Html5QrcodeScannerState.SCANNING) {
      this.html5Qrcode.pause(true);
    }
  }

  private resumeScanner(): void {
    if (this.html5Qrcode?.getState() === Html5QrcodeScannerState.PAUSED) {
      this.html5Qrcode.resume();
    }
  }

  private async stopQrScanner(): Promise<void> {
    const scanner = this.html5Qrcode;
    if (!scanner) {
      return;
    }
    this.html5Qrcode = undefined;

    try {
      if (scanner.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
        await scanner.stop();
      }
      scanner.clear();
    } catch (_e) {
      // The scanner may already be stopped.
    }
  }

  public cameraLabel(camera: CameraDevice, index: number): string {
    return camera.label?.trim() || `Camera ${index + 1}`;
  }

  public toggleCameraPicker(): void {
    this.showCameraPicker = !this.showCameraPicker;
  }

  public async changeCamera(cameraId: string): Promise<void> {
    if (!cameraId) {
      return;
    }

    this.showCameraPicker = false;
    this.switchingCamera = true;

    try {
      await this.startScanner([cameraId]);
      localStorage.setItem(this.rememberedCameraKey, cameraId);
    } catch (e) {
      console.error(e);
      this.selectedCameraId = this.runningCameraId();
      this.showCameraPicker = true;
      this.alertService.error('Unable to start the selected camera', 3000);
    } finally {
      this.switchingCamera = false;
    }
  }

  private rememberedCameraId(): string | null {
    const remembered = localStorage.getItem(this.rememberedCameraKey);
    // Ignore a camera remembered from a device the tutor is no longer using
    return this.availableCameras.some((camera) => camera.id === remembered) ? remembered : null;
  }

  /**
   * The cameras to try, best first. Device labels are too inconsistent to rely on alone, so
   * the browser's own `environment` facing mode is preferred over matching on the label.
   * Only a camera the tutor picked themselves is remembered, so a bad automatic guess is
   * never locked in.
   */
  private cameraStartCandidates(): Array<string | MediaTrackConstraints> {
    const remembered = this.rememberedCameraId();
    const rearCamera = this.availableCameras.find((camera) =>
      this.rearCameraLabelPattern.test(camera.label ?? ''),
    );
    const fallbackIds = [rearCamera?.id, this.availableCameras[0]?.id].filter(
      (id): id is string => !!id && id !== remembered,
    );

    return [
      ...(remembered ? [remembered] : []),
      {facingMode: {exact: 'environment'}},
      ...new Set(fallbackIds),
    ];
  }

  private runningCameraId(): string | null {
    try {
      return this.html5Qrcode?.getRunningTrackSettings()?.deviceId ?? null;
    } catch (_e) {
      // Throws while no camera is running
      return null;
    }
  }

  private async startScanner(candidates: Array<string | MediaTrackConstraints>): Promise<void> {
    await this.stopQrScanner();

    const scanner = new Html5Qrcode('qr-reader', false); // id of the div in the html
    this.html5Qrcode = scanner;

    let lastError: unknown;
    for (const candidate of candidates) {
      try {
        await scanner.start(
          candidate,
          {fps: 10, qrbox: 250},
          (data) => this.decodeQrCode(data),
          undefined,
        );
        this.selectedCameraId =
          this.runningCameraId() ?? (typeof candidate === 'string' ? candidate : null);
        return;
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError ?? 'No camera is available';
  }

  private async startCameraScan(): Promise<void> {
    try {
      // Also prompts for camera permission, which is what makes the device labels readable
      this.availableCameras = await Html5Qrcode.getCameras();
    } catch (e) {
      console.error(e);
      this.scanningQr = false;
      this.alertService.error('Camera permission is required to scan QR codes', 3000);
      return;
    }

    try {
      await this.startScanner(this.cameraStartCandidates());
    } catch (e) {
      console.error(e);
      // Leave the scanner open on the picker so another camera can be tried
      this.showCameraPicker = this.availableCameras.length > 0;
      this.alertService.error('Unable to start the camera', 3000);
    }
  }

  public scanQrCode(): void {
    if (this.attendance && !this.selectedTaskDefinition) {
      this.alertService.error('You must select a task first', 3000);
      return;
    }

    this.scanningQr = true;
    this.loadingStudentData = false;

    if (this.html5Qrcode?.getState() === Html5QrcodeScannerState.PAUSED) {
      this.resumeScanner();
      return;
    }

    this.startCameraScan();
  }

  public openAddEngagementDialog(): void {
    if (!this.project) {
      return;
    }

    this.dialog.open(AddEngagementDialogComponent, {
      data: {project: this.project},
      width: 'calc(100vw - 32px)',
      maxWidth: '640px',
      autoFocus: false,
    });
  }

  public loadTaskComments(event: MouseEvent, task: Task) {
    event.stopPropagation();
    this.selectedTask = task;
  }

  public async setSelectedTasksStatus(status: TaskStatusEnum) {
    const selectedTasks = this.tasksList.selectedOptions.selected.map((taskOption) => {
      return taskOption.value as Task;
    });

    if (status === 'fix_and_resubmit') {
      try {
        const hasReadyDependents = (
          await Promise.all(
            selectedTasks.map((task) =>
              task?.definition && task?.project ? task.hasReadyForFeedbackDependents() : false,
            ),
          )
        ).some(Boolean);

        if (hasReadyDependents) {
          this.confirmationModalService.show(
            'Move dependent tasks to Fix and Resubmit?',
            'One or more selected tasks are prerequisites for other tasks submitted by this student that are Ready for Feedback. Do you want to move those tasks to Fix and Resubmit as well?',
            () => {
              this.updateSelectedTasksStatus(selectedTasks, status, true);
            },
            () => {
              this.updateSelectedTasksStatus(selectedTasks, status, false);
            },
            'Yes, update dependent tasks',
            'No, just selected tasks',
          );
          return;
        }
      } catch (error) {
        this.alertService.error(`Failed to check dependent task statuses: ${error}`, 6000);
      }
    }

    this.updateSelectedTasksStatus(selectedTasks, status, false);
  }

  private updateSelectedTasksStatus(
    selectedTasks: Task[],
    status: TaskStatusEnum,
    moveDependentTasks: boolean,
  ) {
    const onStatusUpdated = (
      task: Task,
      fromStatus: TaskStatusEnum,
      expectedStatus: TaskStatusEnum,
    ) => {
      if (task.status !== expectedStatus) {
        return;
      }

      this.recordClassDiscussion(
        [
          {
            taskDefinitionId: task.definition.id,
            fromStatus: fromStatus,
            toStatus: task.status,
          },
        ],
        false,
      );
    };

    for (const task of selectedTasks) {
      const fromStatus = task.status;
      if (task.definition.assessInPortfolioOnly) {
        const expectedStatus = status === 'complete' ? 'working_on_it' : status;
        task.updateTaskStatus(expectedStatus, true, false, () =>
          onStatusUpdated(task, fromStatus, expectedStatus),
        );
      } else if (status === 'fix_and_resubmit') {
        task.updateTaskStatus(status, true, moveDependentTasks, () =>
          onStatusUpdated(task, fromStatus, status),
        );
      } else {
        task.updateTaskStatus(status, true, false, () => onStatusUpdated(task, fromStatus, status));
      }
    }
  }

  public get canMarkSelectedTasksComplete(): boolean {
    const selectedTasks = this.tasksList?.selectedOptions?.selected ?? [];
    if (!selectedTasks.length) {
      return false;
    }

    return true;
  }

  public get selectedTasksIncludeDiscuss(): boolean {
    const selectedTasks = this.tasksList?.selectedOptions?.selected ?? [];
    return selectedTasks.some((taskOption) => {
      const task = taskOption.value as Task;
      return task.status === 'discuss';
    });
  }

  public markSelectedTasksDicussed() {
    const selectedTasks = this.tasksList.selectedOptions.selected;
    let classDiscussionRecorded = false;
    const onDiscussionRecorded = () => {
      if (!classDiscussionRecorded) {
        classDiscussionRecorded = true;
        this.recordClassDiscussion([], false);
      }
    };

    if (!this.unit?.enforceFeedbackBeforeDiscussedInClass) {
      for (const taskOption of selectedTasks) {
        const task = taskOption.value as Task;
        task.markAsDiscussed(undefined, onDiscussionRecorded);
      }
      return;
    }

    this.discussedInClassReasonModal
      .show(
        'Mark Discussed in Class',
        `Add a tutor note explaining why ${selectedTasks.length} task${
          selectedTasks.length === 1 ? '' : 's'
        } ${selectedTasks.length === 1 ? 'is' : 'are'} being marked as discussed in class.`,
        this.discussedInClassNotePrefix,
      )
      .afterClosed()
      .subscribe((reason) => {
        if (!reason) {
          return;
        }

        for (const taskOption of selectedTasks) {
          const task = taskOption.value as Task;
          task.markAsDiscussed(reason, onDiscussionRecorded);
        }
      });
  }

  public recordClassDiscussion(
    taskStatusUpdates: DiscussionTaskStatusUpdate[] = [],
    showConfirmation: boolean = true,
  ): void {
    if (!this.project) {
      return;
    }

    this.engagementService.recordClassDiscussion(this.project, taskStatusUpdates).subscribe({
      next: () => {
        if (showConfirmation) {
          this.alertService.success('Class discussion recorded.', 3000);
        }
      },
      error: (_error) => {
        this.alertService.error('Unable to record the class discussion.', 5000);
      },
    });
  }

  public markSelectedTasksCheckedIn() {
    const selectedTasks = this.tasksList.selectedOptions.selected;
    if (selectedTasks.length > 1) {
      this.alertService.error('Can only check-in 1 task at a time', 5000);
      return;
    }
    for (const taskOption of selectedTasks) {
      const task = taskOption.value as Task;
      this.taskService.checkInTaskForStudent(task).subscribe({
        next: () => {
          this.taskService.notifyStatusChange(task);
          this.alertService.success('Successfully checked in', 2500);
        },
        error: (_error) => {
          this.alertService.error('Failed to check-in', 5000);
        },
      });
    }
  }

  private getUnit(): Promise<Unit> {
    return new Promise((resolve, reject) => {
      this.unitService.get({id: this._unitId}).subscribe({
        next: (unit) => {
          setTimeout(() => {
            resolve(unit);
          });
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  private loadStudents(unit: Unit): Promise<Project> {
    return new Promise((resolve, reject) => {
      this.projectService.loadStudents(unit, false, false).subscribe((projects) => {
        const project = projects.find((p) => p.student.username === this._username);
        if (!project) {
          reject('Student is not a part of this unit');
        }
        resolve(project);
      });
    });
  }

  private getProject(
    unit: Unit,
    projectId: number,
    recordAttendance: boolean = false,
  ): Promise<Project> {
    return new Promise((resolve, reject) => {
      this.projectService
        .loadProject(projectId, unit, true, recordAttendance)
        .subscribe((project) => {
          if (!project) {
            reject('No project found');
          }
          resolve(project);
        });
    });
  }

  public getTargetTradeString(grade: number) {
    return this.gradeService.gradeLabel(grade, this.project?.unit);
  }

  public refresh() {
    this.decodeQrCode('{"unitId":2,"projectId":20}');
  }

  statusesToInclude: TaskStatusEnum[] = [
    'demonstrate',
    'ready_for_feedback',
    'discuss',
    'attention_required',
    'need_help',
    // 'complete',
    'fix_and_resubmit',
    'redo',
    'rediscuss',
  ];

  public viewAllSubmittedTasks() {
    this.filteredTasks = [...this.allTasks];
  }

  private filteredDiscussionTasks(tasks: readonly Task[]): Task[] {
    return tasks.filter((task) => {
      if (!this.statusesToInclude.includes(task.status)) {
        return false;
      }

      if (
        this.unit?.enforceFeedbackBeforeDiscussedInClass &&
        task.status === 'ready_for_feedback'
      ) {
        return false;
      }

      return true;
    });
  }

  public viewAllFilteredTasks() {
    const discussionTasks = this.filteredDiscussionTasks(this.project?.tasks ?? []);
    this.filteredTasks = [...discussionTasks];
  }

  public getStudentTasks(recordAttendance: boolean = false): void {
    // this.project = null;
    // this.filteredTasks = [];
    // this.selectedTask = null;

    this.getUnit()
      .then((_unit) => {
        this.unit = _unit;
        return this.loadStudents(this.unit);
      })
      .then((student) => {
        return this.getProject(this.unit, student.id, recordAttendance);
      })
      .then((project) => {
        const discussionTasks = this.filteredDiscussionTasks(project.tasks);
        if (!this.attendance) {
          this.filteredTasks = [...discussionTasks];
          this.allTasks = [
            ...project.tasks.filter(
              (task) =>
                task.status !== 'not_started' && // Filter out tasks with no submissions yet
                task.definition.targetGrade <= project.targetGrade, // Filter out tasks that are higher than student's target grade
            ),
          ];
        } else {
          this.filteredTasks = [
            project.tasks.find((t) => t.definition.id === this.selectedTaskDefinition.id),
          ];
        }

        this.selectedTask = this.filteredTasks[0] ?? null;
        this.project = project;
        this.scanningQr = false;
        this.loadingStudentData = false;
        this.stopQrScanner();
        this.applyMobileDiscussionZoom();
      })
      .catch((e) => {
        console.error(e);
        this.alertService.error(e, 5000);
        this.scanQrCode();
      });
  }
}
