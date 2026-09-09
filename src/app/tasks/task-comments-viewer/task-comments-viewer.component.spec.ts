import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA, SimpleChange} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EMPTY, of} from 'rxjs';
import {
  Project,
  Task,
  TaskCommentService,
  TaskService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {FeedbackTemplateService} from 'src/app/api/services/feedback-template.service';
import {CommentsModalService} from 'src/app/common/modals/comments-modal/comments-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {TaskCommentsViewerComponent} from './task-comments-viewer.component';

const taskCommentServiceStub = {
  commentAdded$: EMPTY,
  fetchAll: vi.fn(() => of([])),
};
const taskServiceStub = {
  taskStatusUpdated$: EMPTY,
};
const feedbackTemplateServiceStub = {
  query: vi.fn(() => of([])),
};
const emptyProvider = {};

describe('TaskCommentsViewerComponent', () => {
  let component: TaskCommentsViewerComponent;
  let fixture: ComponentFixture<TaskCommentsViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskCommentsViewerComponent],
      providers: [
        {provide: TaskCommentService, useValue: taskCommentServiceStub},
        {provide: FeedbackTemplateService, useValue: feedbackTemplateServiceStub},
        {provide: UserService, useValue: emptyProvider},
        {provide: TaskService, useValue: taskServiceStub},
        {provide: DoubtfireConstants, useValue: emptyProvider},
        {provide: CommentsModalService, useValue: emptyProvider},
        {provide: AlertService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TaskCommentsViewerComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    fixture = TestBed.createComponent(TaskCommentsViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('scrolls to the latest comment when the comments panel becomes visible', () => {
    const scrollDown = vi.spyOn(component, 'scrollDown');

    component.ngOnChanges({
      commentsVisible: new SimpleChange(false, true, false),
    });

    expect(scrollDown).toHaveBeenCalledOnce();
  });

  it('loads unit and task feedback templates for staff', () => {
    const project = {
      id: 5,
      unit: {id: 20, currentUserIsStaff: true},
    } as Project;
    const task = {
      comments: [],
      definition: {id: 310},
      project,
      unit: project.unit,
      commentCache: {
        get: vi.fn(),
        add: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
      refreshCommentData: vi.fn(),
    } as unknown as Task;
    component.project = project;

    component.fetchComments(task, false);

    expect(feedbackTemplateServiceStub.query).toHaveBeenCalledWith(
      {contextType: 'units', contextId: 20},
      {},
    );
    expect(feedbackTemplateServiceStub.query).toHaveBeenCalledWith(
      {contextType: 'task_definitions', contextId: 310},
      {},
    );
  });
});
