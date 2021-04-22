import {
  Unit,
  csvUploadModalService,
  csvResultModalService,
  unitStudentEnrolmentModal,
} from './../../../../../ajs-upgraded-providers';
import { ViewChild, Component, Input, Inject } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'unit-students-editor',
  templateUrl: 'unit-students-editor.component.html',
  styleUrls: ['unit-students-editor.component.scss'],
})
export class UnitStudentsEditorComponent {
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @Input() unit: any;

  columns: string[] = [
    'student_id',
    'first_name',
    'last_name',
    'student_email',
    'campus',
    'tutorial',
    'enrolled',
    'goto',
  ];
  dataSource: MatTableDataSource<any>;

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    private httpClient: HttpClient,
    @Inject(unitStudentEnrolmentModal) private enrolModal: any,
    @Inject(alertService) private alerts: any,
    @Inject(Unit) private unitService: any,
    @Inject(csvUploadModalService) private csvUploadModal: any,
    @Inject(csvResultModalService) private csvResultModal: any
  ) {}

  ngOnInit() {}

  // The paginator is inside the table
  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.unit.students);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any, filter: string) => data.matches(filter);
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
        case 'student_id':
        case 'first_name':
        case 'last_name':
        case 'student_email':
        case 'enrolled':
          return this.sortCompare(a[sort.active], b[sort.active], isAsc);
        case 'campus':
          return this.sortCompare(a.campus().abbreviation, b.campus().abbreviation, isAsc);
        default:
          return 0;
      }
    });
  }

  public gotoStudent(student: any) {
    student.viewProject(true);
  }

  enrolStudent() {
    this.enrolModal.show(this.unit);
  }

  uploadEnrolments() {
    this.csvUploadModal.show(
      'Upload Students to Enrol',
      'Test message',
      { file: { name: 'Enrol CSV Data', type: 'csv' } },
      this.unitService.enrolStudentsCSVUrl(this.unit),
      (response: any) => {
        // at least one student?
        this.csvResultModal.show('Enrol Student CSV Results', response);
        if (response.success.length > 0) {
          this.unit.refreshStudents();
        }
      }
    );
  }

  uploadWithdrawals() {
    this.csvUploadModal.show(
      'Upload Students to Withdraw',
      'Test message',
      { file: { name: 'Withdraw CSV Data', type: 'csv' } },
      this.unitService.enrolStudentsCSVUrl(this.unit),
      (response: any) => {
        // at least one student?
        this.csvResultModal.show('Withdraw Student CSV Results', response);
        if (response.success.length > 0) {
          this.unit.refreshStudents();
        }
      }
    );
  }

  downloadEnrolments() {
    const url: string = this.unitService.enrolStudentsCSVUrl(this.unit);

    this.httpClient.get(url, { responseType: 'blob', observe: 'response' }).subscribe(
      (response) => {
        const binaryData = [];
        binaryData.push(response.body);
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: 'text/csv' }));
        downloadLink.target = '_blank';
        const filenameRegex = /filename[^;=\n]*=((['']).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(response.headers.get('Content-Disposition'));
        if (matches != null && matches[1]) {
          const filename = matches[1].replace(/['']/g, '');
          downloadLink.setAttribute('download', filename);
        } else {
          downloadLink.setAttribute('download', `${this.unit.code}-enrolments.csv`);
        }
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.parentNode.removeChild(downloadLink);
      },
      (error) => {
        this.alerts.add('danger', `Error downloading enrolments - ${error}`);
      }
    );
  }
}
