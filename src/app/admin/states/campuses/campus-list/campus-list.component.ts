import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { currentUser, alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FormControl } from '@angular/forms';

let ELEMENT_DATA = [
  { abbreviation: 'ABBR-01', name: 'Waterfront', mode: 'Timetable' },
  { abbreviation: 'ABBR-01', name: 'Cloud', mode: 'Automatic' }
];

@Component({
  selector: 'campus-list',
  templateUrl: 'campus-list.component.html',
  styleUrls: ['campus-list.component.scss']
})
export class CampusListComponent {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  // Form controls
  abbreviation = new FormControl('');
  name = new FormControl('');
  sync = new FormControl('');
  // Set up the table
  columns: string[] = ['abbreviation', 'name', 'mode', 'options'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  syncModes = ['Timetable', 'Automatic', 'None'];
  edit: any;



  constructor(
    @Inject(currentUser) private currentUser: any,
    @Inject(alertService) private alertService: any
  ) { }

  clearFormControls() {
    this.abbreviation.setValue('');
    this.name.setValue('');
    this.sync.setValue('');
  }

  // ngOnInit() {
  //   this.data.sort = this.sort;
  // }

  applyFilter(filterValue: string) {
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  save(item, isNew = false) {
    // Do save stuff here
    if (isNew) {
      ELEMENT_DATA.push({ abbreviation: this.abbreviation.value, name: this.name.value, mode: this.sync.value });
      this.table.renderRows();
      this.clearFormControls();
    }
    // this.data = new  (ELEMENT_DATA);
    this.edit = null;
  }

  delete(toDelete) {
    // Perform deletion
  }

  editing(item): boolean {
    return item === this.edit;
  }

  flagEdit(item) {
    this.edit = item;
  }
}
