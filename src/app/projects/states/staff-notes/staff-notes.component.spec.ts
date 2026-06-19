import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UserService} from 'src/app/api/models/doubtfire-model';
import {StaffNoteService} from 'src/app/api/services/staff-note.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {StaffNotesComponent} from './staff-notes.component';

const emptyProvider = {};

describe('StaffNotesComponent', () => {
  let component: StaffNotesComponent;
  let fixture: ComponentFixture<StaffNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffNotesComponent],
      providers: [
        {provide: UserService, useValue: emptyProvider},
        {provide: StaffNoteService, useValue: emptyProvider},
        {provide: AlertService, useValue: emptyProvider},
        {provide: ConfirmationModalService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StaffNotesComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffNotesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
