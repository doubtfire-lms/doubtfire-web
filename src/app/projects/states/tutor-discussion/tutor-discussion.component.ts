import {AfterViewInit, Component, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatSelectionList} from '@angular/material/list';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {StateService, UIRouter} from '@uirouter/core';
import {Html5QrcodeScanner, Html5QrcodeScannerState} from 'html5-qrcode';
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
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';

enum TutorDiscussionTabView {
  SHOW_COMMENTS,
  SHOW_STAFF_NOTES,
  SHOW_DISCUSSION_PROMPTS,
}
@Component({
  selector: 'f-tutor-discussion',
  templateUrl: './tutor-discussion.component.html',
  styleUrl: './tutor-discussion.component.scss',
  encapsulation: ViewEncapsulation.None, // enables custom material-ui css
})
export class TutorDiscussionComponent implements AfterViewInit {
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

  public scanningQr: boolean = false;
  public loadingStudentData: boolean = false;

  private html5QrcodeScanner: Html5QrcodeScanner;

  private _unitId: number;
  private _username: string;

  public TutorDiscussionTabView = TutorDiscussionTabView;
  public footerTabView: TutorDiscussionTabView = TutorDiscussionTabView.SHOW_COMMENTS;

  constructor(
    private unitService: UnitService,
    private authService: AuthenticationService,
    private userService: UserService,
    private projectService: ProjectService,
    private gradeService: GradeService,
    private state: StateService,
    private alertService: AlertService,
    private route: UIRouter,
    private taskCommentService: TaskCommentService,
    private taskService: TaskService,
  ) {}

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
    this.authService.afterAuthCall((result) => {
      if (!result) {
        return this.state.go('sign_in');
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
              this.scanQrCode();
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
      if (this.unitId) {
        this.route.stateService.go('units/tasks/inbox', {
          unitId: this.unitId,
        });
      } else {
        this.route.stateService.go('home');
      }
    } else {
      // Close the camera view
      this.scanningQr = false;
    }
  }

  private changeProject() {
    this.html5QrcodeScanner.pause(true);
    this.loadingStudentData = true;
    setTimeout(() => {
      try {
        this.getStudentTasks();
      } catch (_e) {
        this.alertService.error(`Invalid QR code`, 2000);
        this.loadingStudentData = false;

        setTimeout(() => {
          this.html5QrcodeScanner.resume();
        }, 2000);
      }
    });
  }

  hideQrScannerBloat: boolean = true;

  public scanQrCode() {
    if (this.attendance && !this.selectedTaskDefinition) {
      this.alertService.error('You must select a task first', 3000);
      return;
    }

    this.scanningQr = true;
    this.loadingStudentData = false;

    if (
      this.html5QrcodeScanner &&
      this.html5QrcodeScanner.getState() === Html5QrcodeScannerState.PAUSED
    ) {
      this.html5QrcodeScanner.resume();
    } else {
      this.html5QrcodeScanner?.clear();

      // Trigger video permissions
      // If we call getUserMedia when html5QrcodeScanner is already active, the scanner will break on iOS
      navigator.mediaDevices
        .getUserMedia({video: true})
        .then(() => {
          return navigator.mediaDevices.enumerateDevices();
        })
        .then((devices) => {
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

          setTimeout(() => {
            // Only init the scanner once and let it run in the background
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
        });
    }
  }

  public loadTaskComments(event: MouseEvent, task: Task) {
    event.stopPropagation();
    this.selectedTask = task;
  }

  public setSelectedTasksStatus(status: TaskStatusEnum) {
    const selectedTasks = this.tasksList.selectedOptions.selected;
    for (const taskOption of selectedTasks) {
      const task = taskOption.value as Task;
      if (task.definition.assessInPortfolioOnly) {
        task.updateTaskStatus(status === 'complete' ? 'working_on_it' : status, true);
      } else {
        task.updateTaskStatus(status, true);
      }
    }
  }

  public markSelectedTasksDicussed() {
    const selectedTasks = this.tasksList.selectedOptions.selected;
    for (const taskOption of selectedTasks) {
      const task = taskOption.value as Task;
      task.markAsDiscussed();
    }
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
    return this.gradeService.grades[grade];
  }

  public refresh() {
    this.decodeQrCode('{"unitId":2,"projectId":20}');
  }

  statusesToInclude: TaskStatusEnum[] = [
    'demonstrate',
    'ready_for_feedback',
    'discuss',
    'need_help',
    // 'complete',
    'fix_and_resubmit',
    'redo',
  ];

  public viewAllSubmittedTasks() {
    this.filteredTasks = [...this.allTasks];
  }

  public viewAllFilteredTasks() {
    const discussionTasks = this.project?.tasks.filter((task) =>
      this.statusesToInclude.includes(task.status),
    );
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
        const discussionTasks = project.tasks.filter((task) =>
          this.statusesToInclude.includes(task.status),
        );
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
