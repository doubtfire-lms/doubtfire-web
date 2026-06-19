import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {AlertService} from '../../services/alert.service';
import {SidekiqProgressModalComponent} from './sidekiq-progress-modal.component';
import {SidekiqProgressModalService} from './sidekiq-progress-modal.service';

const emptyProvider = {};

describe('SidekiqProgressModalComponent', () => {
  let component: SidekiqProgressModalComponent;
  let fixture: ComponentFixture<SidekiqProgressModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidekiqProgressModalComponent],
      providers: [
        {provide: AlertService, useValue: emptyProvider},
        {provide: MAT_DIALOG_DATA, useValue: emptyProvider},
        {provide: MatDialogRef, useValue: emptyProvider},
        {provide: SidekiqJobService, useValue: emptyProvider},
        {provide: SidekiqProgressModalService, useValue: emptyProvider},
        {provide: MatSnackBar, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SidekiqProgressModalComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidekiqProgressModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
