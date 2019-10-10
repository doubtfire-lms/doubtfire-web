import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { currentUser, alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { CampusService } from 'src/app/api/models/campus/campus.service';
import { Campus } from 'src/app/api/models/campus/campus';

@Component({
  selector: 'campus-list',
  templateUrl: 'campus-list.component.html',
  styleUrls: ['campus-list.component.scss']
})
export class CampusListComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Form controls
  abbreviation = new FormControl('');
  name = new FormControl('');
  sync = new FormControl('');

  // Set up the table
  columns: string[] = ['abbreviation', 'name', 'mode', 'options'];
  campuses: Campus[] = new Array<Campus>();
  dataSource = new MatTableDataSource(this.campuses);

  syncModes = ['timetable', 'automatic', 'manual'];
  selectedCampus: Campus;

  constructor(
    private campusService: CampusService,
    // tslint:disable-next-line: no-shadowed-variable
    @Inject(alertService) private alertService: any
  ) { }

  clearFormControls() {
    this.abbreviation.setValue('');
    this.name.setValue('');
    this.sync.setValue('');
  }

  ngOnInit() {
    this.campusService.query().subscribe((campuses) => {
      this.campuses.push(...campuses);
      this.table.renderRows();
    });
  }

  applyFilter(filterValue: string) {
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  update(campus: Campus) {
    this.campusService.update(campus).subscribe(
      () => {
        this.alertService.add('success', 'Campus edited', 2000);
      },
      error => {
        this.alertService.add('danger', error, 2000);
      });
    this.selectedCampus = null;
  }

  delete(campus: Campus) {
    this.campusService.delete(campus).subscribe();
    this.selectedCampus = null;
  }

  saveNew() {
    const newCampus = new Campus({ abbreviation: this.abbreviation.value, name: this.name.value, mode: this.sync.value });
    this.campusService.create(newCampus).subscribe(result => {
      this.campuses.push(result);
      this.table.renderRows();
      this.clearFormControls();
    });
  }

  cancelEdit() {
    this.selectedCampus = null;
  }

  editing(item: Campus): boolean {
    return item === this.selectedCampus;
  }

  flagEdit(item) {
    this.selectedCampus = item;
  }
}
