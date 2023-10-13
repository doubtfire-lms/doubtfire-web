import { TestBed } from '@angular/core/testing';

import { TasksViewerService } from './tasks-viewer.service';

describe('TasksViewerService', () => {
  let service: TasksViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
