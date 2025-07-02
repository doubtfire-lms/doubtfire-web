import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatSelectionList} from '@angular/material/list';
import {StateService} from '@uirouter/core';
import {Html5QrcodeScanner} from 'html5-qrcode';
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
  selector: 'f-tutor-marking',
  templateUrl: './tutor-marking.component.html',
  styleUrl: './tutor-marking.component.scss',
  encapsulation: ViewEncapsulation.None, // enables custom material-ui css
})
export class TutorMarkingComponent implements OnInit {
  @Input() unitId: number;
  @Input() projectId: number;

  @ViewChild('tasks') tasksList: MatSelectionList;

  public filteredTasks: Task[] = [];
  public project: Project | null;

  public selectedTask: Task | null;

  public scanningQr: boolean = false;
  public loadingStudentData: boolean = false;

  private html5QrcodeScanner: Html5QrcodeScanner;

  private _unitId: number;
  private _projectId: number;

  constructor(
    // private userService: UserService,
    private unitService: UnitService,
    private authService: AuthenticationService,
    private projectService: ProjectService,
    // private taskService: TaskService,
    private gradeService: GradeService,
    private state: StateService,
    private alertService: AlertService,
    // private router: UIRouter,
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
      const qrData = JSON.parse(data);
      if (qrData && 'unitId' in qrData && 'projectId' in qrData) {
        this.changeProject(qrData.unitId, qrData.projectId);
      } else {
        const params = new URL(data).searchParams;
        const unitId = Number(params.get('unitId'));
        const projectId = Number(params.get('projectId'));
        this.changeProject(unitId, projectId);
      }
    } catch (e) {
      console.log(e);
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

  public scanQrCode() {
    this.scanningQr = true;
    this.loadingStudentData = false;

    // Trigger permission
    navigator.mediaDevices.getUserMedia({video: true}).then(() => {
      setTimeout(() => {
        if (!this.html5QrcodeScanner) {
          this.html5QrcodeScanner = new Html5QrcodeScanner(
            'qr-reader',
            {fps: 10, qrbox: 250},
            false,
          );

          this.html5QrcodeScanner.render(
            (data) => {
              console.log(data);
              this.decodeQrCode(data);
            },
            (_error) => {
              // console.error(error);
            },
          );
        } else {
          this.html5QrcodeScanner.resume();
        }
      });
    });
  }

  public selectTask(task: Task) {
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

  public loadAllTasks() {
    // TODO: filter out tasks higher than student's target grade
    // TODO: filter out tasks with no submissions
    this.filteredTasks = [...this.project.tasks];
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
        this.selectedTask = discussionTasks[0];
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
