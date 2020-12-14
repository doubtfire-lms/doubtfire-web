import { TestBed } from '@angular/core/testing';

import { TaskCommentViewService } from './task-comment.service';

describe('TaskCommentViewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaskCommentViewService = TestBed.inject(TaskCommentViewService);
    expect(service).toBeTruthy();
  });
});
