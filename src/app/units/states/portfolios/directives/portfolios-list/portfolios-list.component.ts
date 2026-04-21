import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Project} from 'src/app/api/models/project';
import {TaskStatusEnum} from 'src/app/api/models/task-status';
import {Unit} from 'src/app/api/models/unit';
import {TaskService} from 'src/app/api/services/task.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {D2lTransferModal} from '../../d2l-transfer-modal/d2l-transfer.component';

@Component({
  selector: 'f-portfolios-list',
  templateUrl: './portfolios-list.component.html',
  styleUrl: './portfolios-list.component.scss',
})
export class PortfoliosListComponent implements OnInit, AfterViewInit {
  @Input() unit: Unit;

  @Output()
  public studentSelected = new EventEmitter<Project>();

  displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<Project>([]);

  public portfolioFilter: 'all' | 'submitted_only' = 'submitted_only';
  public tutorialFilter: 'all' | 'mine' = 'all';
  public gradeFilter: number | null = null;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private gradeService: GradeService,
    private fileDownloaderService: FileDownloaderService,
    private unitService: UnitService,
    private alertService: AlertService,
    private sidekiq: SidekiqProgressModalService,
    private d2lTransferModal: D2lTransferModal,
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.updateDataSource();
  }

  openProject(event: Event, project: Project) {
    event.stopPropagation();
    window.open(`/#/projects/${project.id}/dashboard/?tutor=true`, '_blank');
  }

  downloadGrades() {
    this.fileDownloaderService.downloadFile(this.unit.gradesUrl, `${this.unit.code}-grades.csv`);
  }

  downloadPortfolios() {
    this.unitService.zipPortfolios(this.unit).subscribe({
      next: (newJob) => {
        this.sidekiq.show(`Downloading Portfolios: ${this.unit.code}`, newJob.id).subscribe({
          next: () => {
            this.fileDownloaderService.downloadFile(
              this.unit.portfoliosUrl,
              `${this.unit.code}-portfolios.zip`,
            );
          },
          error: (error) => {
            this.alertService.error(error, 6000);
          },
        });
      },
      error: (error) => {
        this.alertService.error(`Could not download portfolios: ${error}`, 6000);
      },
    });
  }

  public hasD2lMapping() {
    return this.unit.hasD2lMapping();
  }

  transferToD2l() {
    this.d2lTransferModal.open(this.unit);
  }

  public get gradeValues() {
    return this.gradeService.gradeValues;
  }

  public gradeLabel(grade) {
    return this.gradeService.grades[grade];
  }

  updateDataSource() {
    const currentUser = this.userService.currentUser;

    const students = this.unit.students
      .filter((p) => (this.portfolioFilter === 'submitted_only' ? p.hasPortfolio : true))
      .filter((p) => (this.tutorialFilter === 'mine' ? p.hasTutor(currentUser) : true))
      .filter((p) => (this.gradeFilter !== null ? p.submittedGrade === this.gradeFilter : true));

    this.displayedColumns = [
      'student',
      'name',
      'tutor',
      'tutorial',
      'target',
      'submitted-as',
      'submission-date',
      ...(this.portfolioFilter === 'all' ? ['has-portfolio'] : []),
      'stats',
      'grade',
      'actions',
    ];

    this.dataSource.data = students;
    this.dataSource.paginator?.firstPage();
  }

  onPortfolioFilterChange(event: MatButtonToggleChange) {
    this.portfolioFilter = event.value;
    this.updateDataSource();
  }

  onTutorialFilterChange(event: MatButtonToggleChange) {
    this.tutorialFilter = event.value;
    this.updateDataSource();
  }

  onGradeFilterChange(event: MatButtonToggleChange) {
    this.gradeFilter = event.value;
    this.updateDataSource();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.dataSource.filterPredicate = (project, filter) => {
      const text = [
        project.student.studentId,
        project.student.username,
        project.student.name,
        project.tutorNames(),
        project.shortTutorialDescription(),
        String(project.grade),
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(filter);
    };
  }

  selectStudent(project: Project) {
    this.studentSelected.emit(project);
  }

  public statusColor(status: TaskStatusEnum): string {
    return this.taskService.statusColors.get(status);
  }

  public statusLabel(status: TaskStatusEnum): string {
    return this.taskService.statusLabels.get(status);
  }

  private sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      switch (sort.active) {
        case 'student':
          return this.sortCompare(
            a.student.studentId || a.student.username,
            b.student.studentId || b.student.username,
            sort.direction === 'asc',
          );
        case 'name':
          return this.sortCompare(a.student?.name, b.student?.name, sort.direction === 'asc');
        case 'tutor': {
          return this.sortCompare(a.tutorNames(), b.tutorNames(), sort.direction === 'asc');
        }
        case 'tutorial':
          return this.sortCompare(
            a.shortTutorialDescription(),
            b.shortTutorialDescription(),
            sort.direction === 'asc',
          );

        case 'target':
          return this.sortCompare(a.targetGrade, b.targetGrade, sort.direction === 'asc');
        case 'submitted-as':
          return this.sortCompare(a.submittedGrade, b.submittedGrade, sort.direction === 'asc');
        case 'submission-date':
          return this.sortCompare(
            a.portfolioSubmissionDate?.getTime() ?? 0,
            b.portfolioSubmissionDate?.getTime() ?? 0,
            sort.direction === 'asc',
          );
        case 'has-portfolio':
          return this.sortCompare(
            a.hasPortfolio.toString(),
            b.hasPortfolio.toString(),
            sort.direction === 'asc',
          );
        case 'grade':
          return this.sortCompare(a.grade, b.grade, sort.direction === 'asc');
        default:
          return 0;
      }
    });
  }
}
