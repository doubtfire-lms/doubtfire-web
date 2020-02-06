import { ViewChild, Component } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'unit-students-editor',
  templateUrl: 'unit-students-editor.component.html',
  styleUrls: ['unit-students-editor.component.scss']
})
export class UnitStudentsEditorComponent {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
  ) {
  }

  ngOnInit() {
  }
}
