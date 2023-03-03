import {
  csvUploadModalService,
  csvResultModalService,
  unitStudentEnrolmentModal,
} from './../../../../../ajs-upgraded-providers';
import { ViewChild, Component, Input, Inject, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyTable as MatTable, MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatSort, Sort } from '@angular/material/sort';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { HttpClient } from '@angular/common/http';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader';
import { Project, ProjectService, Unit } from 'src/app/api/models/doubtfire-model';
import { UIRouter } from '@uirouter/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'unit-students-editor',
  templateUrl: 'unit-students-editor.component.html',
  styleUrls: ['unit-students-editor.component.scss'],
})
export class UnitStudentsEditorComponent implements OnInit, OnDestroy {
  @ViewChild(MatTable, { static: false }) table: MatTable<Project>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

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
  dataSource: MatTableDataSource<Project>;

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    private httpClient: HttpClient,
    @Inject(unitStudentEnrolmentModal) private enrolModal: any,
    @Inject(alertService) private alerts: any,
    @Inject(csvUploadModalService) private csvUploadModal: any,
    @Inject(csvResultModalService) private csvResultModal: any,
    private fileDownloader: FileDownloaderService,
    private router: UIRouter,
    private projectService: ProjectService
  ) {}

  // The paginator is inside the table
  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.unit.studentCache.currentValuesClone());
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any, filter: string) => data.matches(filter);

    this.subscriptions.push(this.unit.studentCache.values.subscribe(
      (students) => {
        this.dataSource.data = students;
      }
    ));

    this.subscriptions.push(this.projectService.loadStudents(this.unit, true).subscribe(
      (projects) => {
        // projects included in unit...
        console.log("loaded withdrawn students")
      }
    ));

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( (s) => s.unsubscribe());
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'username':
        case 'firstName':
        case 'lastName':
        case 'email':
        case 'enrolled':
          return this.sortCompare(a[sort.active], b[sort.active], isAsc);
        case 'campus':
          return this.sortCompare(a.campus.abbreviation, b.campus.abbreviation, isAsc);
        default:
          return 0;
      }
    });
  }

  public gotoStudent(student: Project) {
    this.router.stateService.go("projects/dashboard", {projectId: student.id, tutor: true, taskAbbr:''})
  }

  enrolStudent() {
    this.enrolModal.show(this.unit);
  }

  uploadEnrolments() {
    this.csvUploadModal.show(
      'Upload Students to Enrol',
      'Test message',
      { file: { name: 'Enrol CSV Data', type: 'csv' } },
      this.unit.enrolStudentsCSVUrl,
      (response: any) => {
        // at least one student?
        this.csvResultModal.show('Enrol Student CSV Results', response);
        if (response.success.length > 0) {
          this.unit.refreshStudents(true);
        }
      }
    );
  }

  uploadWithdrawals() {
    this.csvUploadModal.show(
      'Upload Students to Withdraw',
      'Test message',
      { file: { name: 'Withdraw CSV Data', type: 'csv' } },
      this.unit.withdrawStudentsCSVUrl,
      (response: any) => {
        // at least one student?
        this.csvResultModal.show('Withdraw Student CSV Results', response);
        if (response.success.length > 0) {
          this.unit.refreshStudents(true);
        }
      }
    );
  }

  downloadEnrolments() {
    const url: string = this.unit.enrolStudentsCSVUrl;

    this.fileDownloader.downloadFile(url, `${this.unit.code}-students.csv`);
  }
}
