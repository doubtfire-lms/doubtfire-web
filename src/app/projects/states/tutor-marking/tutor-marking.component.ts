import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatSelectionList} from '@angular/material/list';
import {StateService, UIRouter} from '@uirouter/core';
import QrScanner from 'qr-scanner';
import {
  AuthenticationService,
  Project,
  ProjectService,
  Task,
  TaskService,
  TaskStatusEnum,
  Unit,
  UnitService,
  User,
} from 'src/app/api/models/doubtfire-model';
import {UserService} from 'src/app/api/services/user.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-tutor-marking',
  templateUrl: './tutor-marking.component.html',
  styleUrl: './tutor-marking.component.scss',
  // encapsulation: ViewEncapsulation.None, // enables custom material-ui css
})
export class TutorMarkingComponent implements OnInit {
  @Input() unitId: number;
  @Input() projectId: number;

  @ViewChild('tasks') tasksList: MatSelectionList;
  @ViewChild('qrScanner') qrScannerElement: ElementRef<HTMLVideoElement>;

  public filteredTasks: Task[] = [];
  public project: Project | null;
  public student: User | null;

  public selectedTask: Task | null;

  public scanningQr: boolean = false;
  private qrScanner: QrScanner = null;

  constructor(
    private userService: UserService,
    private unitService: UnitService,
    private authService: AuthenticationService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private gradeService: GradeService,
    private state: StateService,
    private router: UIRouter,
  ) {}

  public ngOnInit(): void {
    this.projectId = Number(this.projectId);
    this.unitId = Number(this.unitId);

    this.authService.afterAuthCall((result) => {
      if (!result) {
        return this.state.go('sign_in');
      } else {
        this.getStudentTasks();
      }
    });
  }

  private decodeQrCode(data: string) {
    try {
      const qrData = JSON.parse(data);
      if (qrData && 'unitId' in qrData && 'projectId' in qrData) {
        this.qrScanner.stop();
        this.scanningQr = false;
        this.router.stateService.go('tutor-marking', {
          unitId: qrData.unitId,
          projectId: qrData.projectId,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  public scanQrCode() {
    this.scanningQr = true;

    setTimeout(() => {
      this.qrScanner = new QrScanner(
        this.qrScannerElement.nativeElement,
        (result) => {
          if (result && result.data) {
            this.decodeQrCode(result.data);
          }
        },
        {
          highlightScanRegion: true,
          maxScansPerSecond: 10,
          preferredCamera: 'environment',
          onDecodeError: (error) => {
            console.error(error);
          },
        },
      );
      this.qrScanner
        .start()
        .then(() => {
          console.log('starting scan');
        })
        .catch((err) => {
          console.log('could not start qr scanner...', err);
          this.scanningQr = false;
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
      this.unitService.get({id: this.unitId}).subscribe({
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
        const project = projects.find((p) => p.id === this.projectId);
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
    const projectIds = [10, 13, 8, 11, 17, 0, 6, 14, 16, 5]; // debug list of valid projectIds
    // this.getStudentTasks();
    const randomId = projectIds[Math.floor(Math.random() * projectIds.length)];
    const newRoute = `tutor/marking?unitId=${this.unitId}&username=x&projectId=${randomId}`;
    // this.router.stateService.go(newRoute);

    this.router.stateService.go('tutor-marking', {
      unitId: this.unitId,
      username: `student_${randomId}`,
      // projectId: ,
    });
    console.log(newRoute);
  }

  public loadAllTasks() {
    // TODO: filter out tasks higher than student's target grade
    // TODO: filter out tasks with no submissions
    this.filteredTasks = [...this.project.tasks];
  }

  public async getStudentTasks(): Promise<void> {
    console.time('getStudentTasks()');
    // this.student = null;
    this.project = null;
    this.filteredTasks = [];
    this.selectedTask = null;
    try {
      const unit = await this.getUnit();
      const student = await this.loadStudents(unit);
      this.student = student.student;
      // const project = await this.getProject(unit);
      const project = await this.getProject(unit, student.id);
      console.log(project);
      // this.student = project.student;
      this.project = project;

      const statusesToFetch: TaskStatusEnum[] = [
        'demonstrate',
        'ready_for_feedback',
        'discuss',
        'need_help',
        // 'complete',
        'fix_and_resubmit',
        'redo',
      ];

      const discussionTasks = project.tasks.filter((task) => statusesToFetch.includes(task.status));
      console.log(discussionTasks);
      this.selectedTask = discussionTasks[0];
      this.filteredTasks = [...discussionTasks];

      setTimeout(() => this.tasksList.selectAll());

      console.timeEnd('getStudentTasks()');
    } catch (err) {
      console.error('Failed to fetch tasks');
      console.error(err);
    }
  }
}
