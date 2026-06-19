import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AuthenticationService,
  ProjectService,
  TaskCommentService,
  TaskService,
  UnitService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {DiscussedInClassReasonModalService} from 'src/app/common/modals/discussed-in-class-reason-modal/discussed-in-class-reason-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {TutorDiscussionComponent} from './tutor-discussion.component';

const emptyProvider = {};

describe('TutorDiscussionComponent', () => {
  let component: TutorDiscussionComponent;
  let fixture: ComponentFixture<TutorDiscussionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TutorDiscussionComponent],
      providers: [
        {provide: UnitService, useValue: emptyProvider},
        {provide: AuthenticationService, useValue: emptyProvider},
        {provide: UserService, useValue: emptyProvider},
        {provide: ProjectService, useValue: emptyProvider},
        {provide: GradeService, useValue: emptyProvider},
        {provide: Router, useValue: emptyProvider},
        {provide: ActivatedRoute, useValue: emptyProvider},
        {provide: AlertService, useValue: emptyProvider},
        {provide: ConfirmationModalService, useValue: emptyProvider},
        {provide: DiscussedInClassReasonModalService, useValue: emptyProvider},
        {provide: TaskCommentService, useValue: emptyProvider},
        {provide: TaskService, useValue: emptyProvider},
        {provide: MatDialog, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TutorDiscussionComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorDiscussionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
