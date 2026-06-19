import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EMPTY} from 'rxjs';
import {TaskCommentService, TaskService, UserService} from 'src/app/api/models/doubtfire-model';
import {FeedbackTemplateService} from 'src/app/api/services/feedback-template.service';
import {CommentsModalService} from 'src/app/common/modals/comments-modal/comments-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {TaskCommentsViewerComponent} from './task-comments-viewer.component';

const taskCommentServiceStub = {
  commentAdded$: EMPTY,
};
const taskServiceStub = {
  taskStatusUpdated$: EMPTY,
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
        {provide: FeedbackTemplateService, useValue: emptyProvider},
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
    fixture = TestBed.createComponent(TaskCommentsViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
