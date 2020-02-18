import { Unit } from './../../../../../ajs-upgraded-providers';
import { TutorialStream } from 'src/app/api/models/tutorial-stream/tutorial-stream';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';
import { ViewChild, Component, Input, Inject } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'unit-students-editor',
  templateUrl: 'unit-students-editor.component.html',
  styleUrls: ['unit-students-editor.component.scss']
})
export class UnitStudentsEditorComponent {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @Input() unit: any;

  columns: string[] = ['student_id', 'first_name', 'last_name', 'student_email', 'campus', 'tutorial', 'enrolled'];
  dataSource: MatTableDataSource<any>;

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    @Inject(alertService) private alerts: any,
    @Inject(Unit) private u: any
  ) {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.unit.students);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
        case 'enrolled':    return this.sortCompare(a[sort.active], b[sort.active], isAsc);
        case 'campus':      return this.sortCompare(a.campus().abbreviation, b.campus().abbreviation, isAsc);
        default:            return 0;
      }
    });
  }
}
