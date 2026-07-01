import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CampusService} from 'src/app/api/services/campus.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {UnitStudentEnrolmentModalComponent} from './unit-student-enrolment-modal.component';

const emptyProvider = {};

describe('UnitStudentEnrolmentModalComponent', () => {
  let component: UnitStudentEnrolmentModalComponent;
  let fixture: ComponentFixture<UnitStudentEnrolmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitStudentEnrolmentModalComponent],
      providers: [
        {provide: MatDialogRef, useValue: emptyProvider},
        {provide: MAT_DIALOG_DATA, useValue: emptyProvider},
        {provide: AlertService, useValue: emptyProvider},
        {provide: CampusService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(UnitStudentEnrolmentModalComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitStudentEnrolmentModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
