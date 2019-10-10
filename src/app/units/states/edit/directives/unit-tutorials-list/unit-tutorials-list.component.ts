import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { currentUser, alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';

const campuses = ['Burwood', 'Coud'];
const sampleSyncData = [
  { name: 'Burwood', mode: 'Automatic' },
  { name: 'Metro', mode: 'Timetable' },
  { name: 'Hawthron', mode: 'None' },
];

@Component({
  selector: 'unit-tutorials-list',
  templateUrl: 'unit-tutorials-list.component.html',
  styleUrls: ['unit-tutorials-list.component.scss']
})
export class UnitTutorialsListComponent implements OnInit {

  @Input() unit: any;

  syncTableColumns: string[] = ['campus', 'sync'];
  syncOptions = ['Timetable', 'Automatic', 'None'];
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  edit: number;


  displayedColumns: string[] = ['abbreviation', 'campus', 'location', 'day', 'time', 'tutor', 'capacity', 'options'];
  dataSource: MatTableDataSource<any>;
  sampleSyncDataSource = new MatTableDataSource(sampleSyncData);
  sync = 'default';

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(currentUser) private currentUser: any,
    @Inject(alertService) private alertService: any,
  ) { }

  save(item) {
    // Do save stuff here
    this.edit = -1;
  }

  editing(id): boolean {
    return id === this.edit;
  }

  flagEdit(id) {
    this.edit = id;
  }

  ngOnInit() {

    this.dataSource = new MatTableDataSource(this.unit.tutorials);
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
