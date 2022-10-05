import { TestBed } from '@angular/core/testing';

import { SelectedTaskService } from './selected-task.service';

describe('SelectedTaskService', () => {
  let service: SelectedTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
