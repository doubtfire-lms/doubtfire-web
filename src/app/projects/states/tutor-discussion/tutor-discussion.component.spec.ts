import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks a task as discussed only after its status update succeeds', async () => {
    let statusUpdateSucceeded: () => void = () => {
      throw new Error('Status update callback was not registered');
    };
    const task = {
      definition: {assessInPortfolioOnly: false},
      canMarkComplete: true,
      updateTaskStatus: vi.fn(
        (
          _status: string,
          _markAsDiscussed: boolean,
          _moveDependentTasks: boolean,
          onSuccess: () => void,
        ) => {
          statusUpdateSucceeded = onSuccess;
        },
      ),
      markAsDiscussed: vi.fn(),
    };
    component.tasksList = {
      selectedOptions: {selected: [{value: task}]},
    } as unknown as typeof component.tasksList;

    await component.setSelectedTasksStatus('complete');

    expect(task.updateTaskStatus).toHaveBeenCalledWith(
      'complete',
      false,
      false,
      expect.any(Function),
    );
    expect(task.markAsDiscussed).not.toHaveBeenCalled();

    statusUpdateSucceeded();

    expect(task.markAsDiscussed).toHaveBeenCalledOnce();
  });

  it('requests attendance recording after a QR scan', () => {
    vi.useFakeTimers();
    const getStudentTasks = vi
      .spyOn(component, 'getStudentTasks')
      .mockImplementation(() => undefined);

    (component as unknown as {changeProject: () => void}).changeProject();
    vi.runAllTimers();

    expect(getStudentTasks).toHaveBeenCalledWith(true);
  });

  it('passes attendance recording to the project fetch', async () => {
    const project = {id: 42};
    const unit = {studentCache: {}};
    const projectService = TestBed.inject(ProjectService) as unknown as {
      loadProject: ReturnType<typeof vi.fn>;
    };
    projectService.loadProject = vi.fn().mockReturnValue(of(project));

    await (
      component as unknown as {
        getProject: (
          requestedUnit: typeof unit,
          projectId: number,
          recordAttendance: boolean,
        ) => Promise<typeof project>;
      }
    ).getProject(unit, project.id, true);

    expect(projectService.loadProject).toHaveBeenCalledWith(project.id, unit, true, true);
  });
});
