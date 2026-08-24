import {HttpClient} from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {Subscription, finalize, timer} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {Project, ProjectService, Unit} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {
  CsvResult,
  CsvResultModalService,
} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from 'src/app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {SpecConModalService} from 'src/app/common/modals/spec-con-modal/spec-con-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {UnitStudentEnrolmentModalService} from 'src/app/units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.service';

@Component({
  selector: 'unit-students-editor',
  templateUrl: 'unit-students-editor.component.html',
  styleUrls: ['unit-students-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitStudentsEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatTable, {static: false}) table: MatTable<Project>;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  @Input() unit: Unit;

  private subscriptions: Subscription[] = [];

  columns: string[] = [
    'username',
    'firstName',
    'lastName',
    'email',
    'campus',
    'tutorial',
    'enrolled',
    'goto',
  ];
  dataSource: MatTableDataSource<Project> = new MatTableDataSource([]);
  loadingStudents = true;

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    private httpClient: HttpClient,
    private enrolModal: UnitStudentEnrolmentModalService,
    private alerts: AlertService,
    private csvUploadModal: CsvUploadModalService,
    private csvResultModal: CsvResultModalService,
    private fileDownloader: FileDownloaderService,
    private router: Router,
    private projectService: ProjectService,
    private specConModalService: SpecConModalService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: Project, filter: string) => data.matches(filter);

    // Reveal cached students right away
    this.loadingStudents = this.unit.studentCache.currentValues.length === 0;

    this.refreshStudentsAfterRender();
  }

  // Data must not reach the table before the paginator does - unpaginated, it renders a row per
  // student and blocks the main thread on a large unit.
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.subscriptions.push(
      this.unit.studentCache.values.subscribe((students) => {
        this.dataSource.data = students;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private refreshStudentsAfterRender(): void {
    this.subscriptions.push(
      timer(0)
        .pipe(
          switchMap(() => this.projectService.loadStudents(this.unit, false, true)),
          // Withdrawn students fold in behind the table rather than holding the skeleton up.
          tap(() => {
            this.loadingStudents = false;
          }),
          switchMap(() => this.projectService.loadStudents(this.unit, true, true)),
          finalize(() => {
            this.loadingStudents = false;
          }),
        )
        .subscribe(() => {
          // projects included in unit...
        }),
    );
  }

  private sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    if (aValue === bValue) {
      return 0;
    }
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data = [...this.dataSource.data].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'username':
          return this.sortCompare(a.student.username, b.student.username, isAsc);
        case 'firstName':
          return this.sortCompare(a.student.firstName, b.student.firstName, isAsc);
        case 'lastName':
          return this.sortCompare(a.student.lastName, b.student.lastName, isAsc);
        case 'email':
          return this.sortCompare(a.student.email, b.student.email, isAsc);
        case 'enrolled':
          return this.sortCompare(Number(a.enrolled), Number(b.enrolled), isAsc);
        case 'campus':
          return this.sortCompare(a.campus?.abbreviation, b.campus?.abbreviation, isAsc);
        case 'tutorial':
          return this.sortCompare(
            a.shortTutorialDescription(),
            b.shortTutorialDescription(),
            isAsc,
          );
        default:
          return 0;
      }
    });
  }

  public gotoStudent(student: Project) {
    this.router.navigate(['/projects', student.id, 'dashboard'], {queryParams: {tutor: true}});
  }

  enrolStudent() {
    this.enrolModal.show(this.unit);
  }

  uploadEnrolments() {
    this.csvUploadModal.show(
      'Upload Students to Enrol',
      'Upload a CSV to enrol students.',
      {file: {name: 'Enrol CSV Data', type: 'csv'}},
      this.unit.enrolStudentsCSVUrl,
      (response: SidekiqJob) => {
        if (!response || !response.id) {
          return this.alerts.error('Failed to start student import job', 6000);
        }
        this.sidekiqProgressModalService
          .show(`Importing Students: ${this.unit.code}`, response.id)
          .subscribe({
            next: (job) => {
              const result = JSON.parse(job.result);
              this.csvResultModal.show('Enrol Student CSV Results', result);
              // at least one student?
              if (result.success.length > 0) {
                this.unit.refreshStudents(true);
              }
            },
            error: (error) => {
              console.error(error);
            },
          });
      },
    );
  }

  uploadStaffNotes() {
    this.csvUploadModal.show(
      'Upload Staff Notes',
      'Upload a CSV with a comment and either a username or login_id column.',
      {file: {name: 'Staff Notes CSV Data', type: 'csv'}},
      this.unit.staffNotesCsvUploadUrl,
      (response: SidekiqJob) => {
        if (!response || !response.id) {
          return this.alerts.error('Failed to start staff notes import job', 6000);
        }
        this.sidekiqProgressModalService
          .show(`Importing Staff Notes: ${this.unit.code}`, response.id)
          .subscribe({
            next: (job) => {
              this.csvResultModal.show('Staff Notes CSV Results', JSON.parse(job.result));
            },
            error: (error) => {
              console.error(error);
            },
          });
      },
    );
  }

  uploadWithdrawals() {
    this.csvUploadModal.show(
      'Upload Students to Withdraw',
      'Upload a CSV to withdraw students.',
      {file: {name: 'Withdraw CSV Data', type: 'csv'}},
      this.unit.withdrawStudentsCSVUrl,
      (response: CsvResult) => {
        // at least one student?
        this.csvResultModal.show('Withdraw Student CSV Results', response);
        if (response.success.length > 0) {
          this.unit.refreshStudents(true);
        }
      },
    );
  }

  downloadEnrolments() {
    const url: string = this.unit.enrolStudentsCSVUrl;

    this.fileDownloader.downloadFile(url, `${this.unit.code}-students.csv`);
  }

  public updateSpecCon(student: Project) {
    this.specConModalService.show(student);
  }
}
