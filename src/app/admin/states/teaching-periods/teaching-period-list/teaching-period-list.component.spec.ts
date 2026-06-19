import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {TeachingPeriodService} from 'src/app/api/services/teaching-period.service';
import {TeachingPeriodUnitImportService} from '../teaching-period-unit-import/teaching-period-unit-import.dialog';
import {TeachingPeriodListComponent} from './teaching-period-list.component';

const emptyProvider = {};

describe('TeachingPeriodListComponent', () => {
  let component: TeachingPeriodListComponent;
  let fixture: ComponentFixture<TeachingPeriodListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeachingPeriodListComponent],
      providers: [
        {provide: TeachingPeriodService, useValue: emptyProvider},
        {provide: MatDialog, useValue: emptyProvider},
        {provide: TeachingPeriodUnitImportService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TeachingPeriodListComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachingPeriodListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
