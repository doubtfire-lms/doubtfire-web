import { Unit } from './../../../../../ajs-upgraded-providers';
import { TutorialStream } from 'src/app/api/models/tutorial-stream/tutorial-stream';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';
import { ViewChild, Component, Input, Inject } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
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

  columns: string[] = ['student_id', 'first_name', 'last_name', 'email', 'tutorial', 'enrolled'];
  dataSource: MatTableDataSource<any>;
  tutorials: Tutorial[];
  streams: TutorialStream[];

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
    this.tutorials = this.unit.tutorials;
    this.streams = this.unit.tutorial_streams;
  }

  compareSelection(aEntity:  any, bEntity: any) {
    if (!aEntity || !bEntity) {
      return;
    }
    return aEntity.id === bEntity.tutorial_id;
  }

  tutorialsForStreamAndStudent(student: any, stream: TutorialStream = undefined) {
    return this.tutorials.filter(tutorial => {
      if (tutorial.tutorial_stream && stream) {
        return tutorial.tutorial_stream.abbreviation === stream.abbreviation
          && student.campus_id === tutorial.campus.id;
      } else if (!tutorial.tutorial_stream && !stream) {
        return student.campus_id === tutorial.campus.id;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
