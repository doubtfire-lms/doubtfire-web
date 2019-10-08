import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { currentUser, alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Need to add abbriviation

const ELEMENT_DATA = [
  { id: 1, abbreviation: 'ABBR-01', name: 'Waterfront', mode: 'Timetable' },
  { id: 2, abbreviation: 'ABBR-01', name: 'Cloud', mode: 'Automatic' }
];

@Component({
  selector: 'campus-list',
  templateUrl: 'campus-list.component.html',
  styleUrls: ['campus-list.component.scss']
})
export class CampusListComponent implements OnInit {

  syncModes = ['Timetable', 'Automatic', 'None'];
  newCampus = false;
  edit: number;

  displayedColumns: string[] = ['abbreviation', 'name', 'mode', 'star'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(currentUser) private currentUser: any,
    @Inject(alertService) private alertService: any
  ) { }

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editing(id): boolean {
    return id === this.edit;
  }

  flagEdit(id) {
    this.edit = id;
  }

  addCampus() {
    this.newCampus = true;
  }

  cancelAddCampus() {
    this.newCampus = false;
  }
}
