import { TutorialStream } from 'src/app/api/models/tutorial-stream/tutorial-stream';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';
import { ViewChild, Component, Input, Inject } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { alertService, Project } from 'src/app/ajs-upgraded-providers';
import { MatPaginator } from '@angular/material/paginator';
import { User } from 'src/app/api/models/user/user';

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

  columns: string[] = ['username', 'firstName', 'lastName', 'email', 'enrolled'];
  dataSource: MatTableDataSource<any>;
  tutorials: Tutorial[];
  streams: TutorialStream[];


  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    @Inject(alertService) private alerts: any,
    @Inject(Project) private project: any
  ) {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.unit.students);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.tutorials = this.unit.tutorials;
    this.streams = this.unit.tutorial_streams;
    // Ensure enrolled column is the last one
    this.columns.splice(this.columns.indexOf('email') + 1, 0, ...this.streams.map(stream => stream.abbreviation));
  }

  compareSelection(aEntity:  any, bEntity: any) {
    if (!aEntity || !bEntity) {
      return;
    }
    return aEntity.id === bEntity.id;
  }

  tutorialsForStream(stream: TutorialStream) {
    return this.tutorials.filter(tutorial => {
      if (tutorial.tutorial_stream) {
        return tutorial.tutorial_stream.abbreviation === stream.abbreviation;
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

  updateStudentEnrollment(student: any) {
    const newEnrollment = !student.enrolled;
    this.project.update({id: student.project_id, enrolled: !student.enrolled}, (project) => {
      if (newEnrollment === project.enrolled) {
        this.alerts.add('success', 'Enrolment changed.', 2000);
      } else {
        this.alerts.add('danger', 'Enrolment change failed.', 5000);
      }
    },
    (response) => {
      this.alerts.add('danger', response.data.error, 5000);
    });
  }
}
