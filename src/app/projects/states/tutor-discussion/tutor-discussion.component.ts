import {Html5QrcodeScanner, Html5QrcodeScannerState} from 'html5-qrcode';
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

  private html5QrcodeScanner?: Html5QrcodeScanner;
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
      this.stopQrScanner();
    }
  }

  private changeProject() {
    this.html5QrcodeScanner?.pause(true);
    this.loadingStudentData = true;
    setTimeout(() => {
      try {
        this.getStudentTasks();
      } catch (_e) {
        this.alertService.error(`Invalid QR code`, 2000);
        this.loadingStudentData = false;

        setTimeout(() => {
          this.html5QrcodeScanner?.resume();
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

  hideQrScannerBloat: boolean = true;

  private async stopQrScanner(): Promise<void> {
    if (!this.html5QrcodeScanner) {
      return;
    }

    try {
      await this.html5QrcodeScanner.clear();
    } catch (_e) {
      // The scanner may already be stopped by its own controls.
    } finally {
      this.html5QrcodeScanner = undefined;
    }
  }

  private async getCameraPermissionState(): Promise<PermissionState | null> {
    if (!navigator.permissions?.query) {
      return null;
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      return permissionStatus.state;
    } catch (_e) {
      return null;
    }
  }

  private async prepareQrScannerCamera(): Promise<void> {
    const cachedScannerData = localStorage.getItem('HTML5_QRCODE_DATA');
    const cameraPermissionState = await this.getCameraPermissionState();
    if (cachedScannerData) {
      try {
        const html5QrcodeData = JSON.parse(cachedScannerData);
        if (html5QrcodeData?.hasPermission && cameraPermissionState === 'granted') {
          this.hideQrScannerBloat = html5QrcodeData.lastUsedCameraId ? true : false;
          return;
        }
      } catch (_e) {
        localStorage.removeItem('HTML5_QRCODE_DATA');
      }
    }

    // Trigger video permissions once so device labels are available for back camera selection.
    // Stopping these tracks releases the camera; the browser keeps the permission grant.
    const stream = await navigator.mediaDevices.getUserMedia({video: true});

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Find the deviceId of the back camera
      const backCameras = devices.filter(
        (d) => d.kind === 'videoinput' && d.label.toLowerCase().includes('back camera'),
      );

      const html5QrcodeData = {
        hasPermission: true,
        lastUsedCameraId: backCameras[0]?.deviceId ?? null,
      };
      localStorage.setItem('HTML5_QRCODE_DATA', JSON.stringify(html5QrcodeData));

      // Hide most of the UI if we found and set the back camera
      // Otherwise, we need to reveal the UI so that the user can select which camera to use
      this.hideQrScannerBloat = html5QrcodeData.lastUsedCameraId ? true : false;
    } finally {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  public scanQrCode() {
    if (this.attendance && !this.selectedTaskDefinition) {
      this.alertService.error('You must select a task first', 3000);
      return;
    }

    this.scanningQr = true;
    this.loadingStudentData = false;

    if (this.html5QrcodeScanner?.getState() === Html5QrcodeScannerState.PAUSED) {
      this.html5QrcodeScanner.resume();
    } else {
      this.stopQrScanner()
        .then(() => this.prepareQrScannerCamera())
        .then(() => {
          setTimeout(() => {
            this.html5QrcodeScanner = new Html5QrcodeScanner(
              'qr-reader', // id of the div in the html
              {fps: 10, qrbox: 250},
              false,
            );

            this.html5QrcodeScanner.render(
              (data) => {
                this.decodeQrCode(data);
              },
              (_error) => {
                // console.error(_error);
              },
            );
          });
        })
        .catch((_e) => {
          this.scanningQr = false;
          this.alertService.error('Camera permission is required to scan QR codes', 3000);
        });
    }
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

    if (status === 'complete') {
      const blockedTasks = selectedTasks.filter(
        (task) => !task.definition.assessInPortfolioOnly && !task.canMarkComplete,
      );
      if (blockedTasks.length > 0) {
        this.alertService.error(
          'Some selected tasks cannot be marked as complete until they are marked as discussed in class.',
          5000,
        );
      }
    }

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
    for (const task of selectedTasks) {
      if (
        status === 'complete' &&
        !task.definition.assessInPortfolioOnly &&
        !task.canMarkComplete
      ) {
        continue;
      }

      if (task.definition.assessInPortfolioOnly) {
        task.updateTaskStatus(status === 'complete' ? 'working_on_it' : status, true);
      } else if (status === 'fix_and_resubmit') {
        task.updateTaskStatus(status, true, moveDependentTasks);
      } else {
        task.updateTaskStatus(status, true);
      }
    }
  }

  public get canMarkSelectedTasksComplete(): boolean {
    const selectedTasks = this.tasksList?.selectedOptions?.selected ?? [];
    if (!selectedTasks.length) {
      return false;
    }

    return selectedTasks.every((taskOption) => {
      const task = taskOption.value as Task;
      return task.definition.assessInPortfolioOnly || task.canMarkComplete;
    });
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
    if (!this.unit?.enforceFeedbackBeforeDiscussedInClass) {
      for (const taskOption of selectedTasks) {
        const task = taskOption.value as Task;
        task.markAsDiscussed();
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
          task.markAsDiscussed(reason);
        }
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

  private getProject(unit: Unit, projectId: number): Promise<Project> {
    return new Promise((resolve, reject) => {
      this.projectService.loadProject(projectId, unit, true).subscribe((project) => {
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

  public getStudentTasks(): void {
    console.time('getStudentTasks()');
    // this.project = null;
    // this.filteredTasks = [];
    // this.selectedTask = null;

    this.getUnit()
      .then((_unit) => {
        this.unit = _unit;
        return this.loadStudents(this.unit);
      })
      .then((student) => {
        return this.getProject(this.unit, student.id);
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
      })
      .finally(() => {
        console.timeEnd('getStudentTasks()');
      });
  }
}
