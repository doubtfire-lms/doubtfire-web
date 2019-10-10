import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { currentUser, alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'institution-settings',
  templateUrl: 'institution-settings.component.html',
  styleUrls: ['institution-settings.component.scss']
})
export class InstitutionSettingsComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
  }
}
