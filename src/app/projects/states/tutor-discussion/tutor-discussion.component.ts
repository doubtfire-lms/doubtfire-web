import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatSelectionList} from '@angular/material/list';
import {StateService, UIRouter} from '@uirouter/core';
import {Html5QrcodeScanner, Html5QrcodeScannerState} from 'html5-qrcode';
import {
  AuthenticationService,
  Project,
  ProjectService,
  Task,
  TaskStatusEnum,
  Unit,
  UnitService,
} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-tutor-discussion',
  templateUrl: './tutor-discussion.component.html',
  styleUrl: './tutor-discussion.component.scss',
  encapsulation: ViewEncapsulation.None, // enables custom material-ui css
})
export class TutorDiscussionComponent implements OnInit {
  @Input() unitId: number;
  @Input() projectId: number;

  @ViewChild('tasks') tasksList: MatSelectionList;

  public filteredTasks: Task[] = [];
  public allTasks: Task[] = [];
  public project: Project | null;

  public selectedTask: Task | null;

  public scanningQr: boolean = false;
  public loadingStudentData: boolean = false;

  private html5QrcodeScanner: Html5QrcodeScanner;

  private _unitId: number;
  private _projectId: number;

  constructor(
    private unitService: UnitService,
    private authService: AuthenticationService,
    private projectService: ProjectService,
    private gradeService: GradeService,
    private state: StateService,
    private alertService: AlertService,
    private route: UIRouter,
  ) {}

  public ngOnInit(): void {
    this.authService.afterAuthCall((result) => {
      if (!result) {
        return this.state.go('sign_in');
      } else {
        if (!this.project) {
          if (this.unitId && this.projectId) {
            this._projectId = Number(this.projectId);
            this._unitId = Number(this.unitId);
            this.getStudentTasks();
          } else {
            this.scanQrCode();
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
      const unitId = Number(params.get('unitId'));
      const projectId = Number(params.get('projectId'));
      if (!isNaN(unitId) && !isNaN(projectId)) {
        this.changeProject(unitId, projectId);
      }
    } catch {
      // QR code data is invalid
    }
  }

  public closeQrReader(): void {
    if (!this.project) {
      // Exiting the route entirely
      this.route.stateService.go('home');
    } else {
      // Close the camera view
      this.scanningQr = false;
    }
  }

  private changeProject(unitId: number, projectId: number) {
    this._unitId = unitId;
    this._projectId = projectId;
    this.html5QrcodeScanner.pause(true);
    this.loadingStudentData = true;
    setTimeout(() => {
      this.getStudentTasks();
    });
  }

  hideQrScannerBloat: boolean = true;

  public scanQrCode() {
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
      task.updateTaskStatus(status);
    }
  }

  private getUnit(): Promise<Unit> {
    return new Promise((resolve, reject) => {
      this.unitService.get({id: this._unitId}).subscribe({
        next: (unit) => {
          resolve(unit);
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
        const project = projects.find((p) => p.id === this._projectId);
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

  statusesToFetch: TaskStatusEnum[] = [
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
      this.statusesToFetch.includes(task.status),
    );
    this.filteredTasks = [...discussionTasks];
  }

  public getStudentTasks(): void {
    console.time('getStudentTasks()');
    // this.project = null;
    // this.filteredTasks = [];
    // this.selectedTask = null;

    let unit: Unit;
    this.getUnit()
      .then((_unit) => {
        unit = _unit;
        return this.loadStudents(unit);
      })
      .then((student) => {
        return this.getProject(unit, student.id);
      })
      .then((project) => {
        const discussionTasks = project.tasks.filter((task) =>
          this.statusesToFetch.includes(task.status),
        );
        this.filteredTasks = [...discussionTasks];
        this.allTasks = [
          ...project.tasks.filter(
            (task) =>
              task.status !== 'not_started' && // Filter out tasks with no submissions yet
              task.definition.targetGrade <= project.targetGrade, // Filter out tasks that are higher than student's target grade
          ),
        ];
        this.selectedTask = discussionTasks[0] ?? null;
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
