import { ViewChild, Component, Input, Inject } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { ConsoleReporter } from 'jasmine';

@Component({
  selector: 'unit-students-editor',
  templateUrl: 'unit-students-editor.component.html',
  styleUrls: ['unit-students-editor.component.scss']
})
export class UnitStudentsEditorComponent {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() unit: any;

  columns: string[] = ['username', 'firstName', 'lastName', 'email', 'tutorial', 'enrolled'];
  dataSource: MatTableDataSource<any>;
  tutorials: any[];


  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    @Inject(alertService) private alerts: any,
  ) {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.unit.students);
    this.tutorials = this.unit.tutorials;
    console.log(this.unit.students);
  }

  compareSelection(aEntity:  any, bEntity: any) {
    if (!aEntity || !bEntity) {
      return;
    }
    return aEntity.id === bEntity.id;
  }
}
