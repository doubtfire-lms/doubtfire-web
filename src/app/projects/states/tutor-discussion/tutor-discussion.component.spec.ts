import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';
import {
  AuthenticationService,
  EngagementService,
  ProjectService,
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
        {provide: EngagementService, useValue: emptyProvider},
        {provide: GradeService, useValue: emptyProvider},
        {provide: Router, useValue: emptyProvider},
        {provide: ActivatedRoute, useValue: emptyProvider},
        {provide: AlertService, useValue: emptyProvider},
        {provide: ConfirmationModalService, useValue: emptyProvider},
        {provide: DiscussedInClassReasonModalService, useValue: emptyProvider},
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

  it('starts without a preselected task', () => {
    expect(component.selectedTask).toBeNull();
  });

  it('selects one task for both actions and comments', () => {
    const task = {id: 12};

    component.selectTask(task as typeof component.selectedTask);

    expect(component.selectedTask).toBe(task);
  });

  it('marks a task complete with the discussed flag', async () => {
    let statusUpdateSucceeded: () => void = () => {
      throw new Error('Status update callback was not registered');
    };
    const task = {
      definition: {id: 7, assessInPortfolioOnly: false},
      status: 'ready_for_feedback',
      canMarkComplete: false,
      updateTaskStatus: vi.fn(
        (
          status: string,
          _markAsDiscussed: boolean,
          _moveDependentTasks: boolean,
          onSuccess: () => void,
        ) => {
          statusUpdateSucceeded = () => {
            task.status = status;
            onSuccess();
          };
        },
      ),
    };
    component.selectedTask = task as unknown as typeof component.selectedTask;
    const recordClassDiscussion = vi
      .spyOn(component, 'recordClassDiscussion')
      .mockImplementation(() => undefined);

    await component.setSelectedTaskStatus('complete');

    expect(task.updateTaskStatus).toHaveBeenCalledWith(
      'complete',
      true,
      false,
      expect.any(Function),
      expect.any(Function),
    );
    expect(recordClassDiscussion).not.toHaveBeenCalled();

    statusUpdateSucceeded();

    expect(recordClassDiscussion).toHaveBeenCalledWith(
      [
        {
          taskDefinitionId: 7,
          fromStatus: 'ready_for_feedback',
          toStatus: 'complete',
        },
      ],
      false,
    );
  });

  it('does not mark a task as discussed when the backend leaves its status unchanged', async () => {
    const task = {
      definition: {id: 7, assessInPortfolioOnly: false},
      status: 'ready_for_feedback',
      canMarkComplete: false,
      updateTaskStatus: vi.fn(
        (
          _status: string,
          _markAsDiscussed: boolean,
          _moveDependentTasks: boolean,
          onSuccess: () => void,
        ) => onSuccess(),
      ),
    };
    component.selectedTask = task as unknown as typeof component.selectedTask;
    const recordClassDiscussion = vi
      .spyOn(component, 'recordClassDiscussion')
      .mockImplementation(() => undefined);

    await component.setSelectedTaskStatus('complete');

    expect(recordClassDiscussion).not.toHaveBeenCalled();
  });

  it('refreshes the selected task comments when a status update is rejected', async () => {
    const task = {
      id: 12,
      definition: {id: 7, assessInPortfolioOnly: false},
      status: 'ready_for_feedback',
      updateTaskStatus: vi.fn(
        (
          _status: string,
          _markAsDiscussed: boolean,
          _moveDependentTasks: boolean,
          _onSuccess: () => void,
          onFailure: () => void,
        ) => onFailure(),
      ),
    };
    const fetchComments = vi.fn();
    component.selectedTask = task as unknown as typeof component.selectedTask;
    component.commentsViewer = {fetchComments} as unknown as typeof component.commentsViewer;

    await component.setSelectedTaskStatus('complete');

    expect(fetchComments).toHaveBeenCalledWith(task, false);
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

  it('records a class discussion without task status updates', () => {
    const project = {id: 42};
    const engagementService = TestBed.inject(EngagementService) as unknown as {
      recordClassDiscussion: ReturnType<typeof vi.fn>;
    };
    engagementService.recordClassDiscussion = vi.fn().mockReturnValue(of(true));
    component.project = project as typeof component.project;

    component.recordClassDiscussion([], false);

    expect(engagementService.recordClassDiscussion).toHaveBeenCalledWith(project, []);
  });
});
