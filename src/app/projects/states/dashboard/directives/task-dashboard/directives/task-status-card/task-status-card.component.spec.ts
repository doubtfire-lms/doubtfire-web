import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EMPTY} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {TaskStatus, TaskStatusEnum} from 'src/app/api/models/task-status';
import {UnitRole} from 'src/app/api/models/unit-role';
import {TaskService} from 'src/app/api/services/task.service';
import {UserService} from 'src/app/api/services/user.service';
import {ExtensionModalService} from 'src/app/common/modals/extension-modal/extension-modal.service';
import {QrModalService} from 'src/app/common/modals/qr-modal/qr-modal.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {FeedbackAppealModalService} from 'src/app/tasks/modals/feedback-appeal-modal/feedback-appeal-modal.service';
import {SubmissionTypeModalService} from 'src/app/tasks/modals/submission-type-modal/submission-type-modal.service';
import {TaskStatusCardComponent} from './task-status-card.component';

const taskServiceStub = {
  taskStatusUpdated$: EMPTY,
  statusKeys: TaskStatus.STATUS_KEYS,
  switchableStates: TaskStatus.SWITCHABLE_STATES,
  statusData: (status: TaskStatusEnum) => ({status}),
};
const emptyProvider = {};
const userServiceStub = {
  currentUser: {id: 1, systemRole: 'Tutor'},
};

describe('TaskStatusCardComponent', () => {
  let component: TaskStatusCardComponent;
  let fixture: ComponentFixture<TaskStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskStatusCardComponent],
      providers: [
        {provide: ExtensionModalService, useValue: emptyProvider},
        {provide: TaskService, useValue: taskServiceStub},
        {provide: QrModalService, useValue: emptyProvider},
        {provide: DoubtfireConstants, useValue: emptyProvider},
        {provide: SubmissionTypeModalService, useValue: emptyProvider},
        {provide: UserService, useValue: userServiceStub},
        {provide: FeedbackAppealModalService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TaskStatusCardComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskStatusCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows every task status to staff on the first task displayed', () => {
    const currentUnitRole = {
      role: 'Tutor',
      user: userServiceStub.currentUser,
    } as UnitRole;
    component.task = {
      status: 'working_on_it',
      canMarkComplete: false,
      project: {unit: {staff: [currentUnitRole]}},
    } as unknown as Task;

    component.reapplyTriggers();

    expect(component.triggers.map((trigger) => trigger.status)).toEqual(TaskStatus.STATUS_KEYS);
  });
});
