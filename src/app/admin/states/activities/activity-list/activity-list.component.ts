import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { currentUser, alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

let ELEMENT_DATA = [
  { id: 1, abbreviation: 'Tut', name: 'Tutorial' },
  { id: 2, abbreviation: 'Wksp', name: 'Workshop' }
];

@Component({
  selector: 'activity-list',
  templateUrl: 'activity-list.component.html',
  styleUrls: ['activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'abbreviation', 'options'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  edit: number;

  ngOnInit() {

  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  save(item) {
    // Do save stuff here
    this.edit = -1;
  }

  delete(toDelete) {
    // Perform deletion
  }

  editing(id): boolean {
    return id === this.edit;
  }

  flagEdit(id) {
    this.edit = id;
  }

}
