import {beforeEach, describe, expect, it} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {TaskService} from 'src/app/api/services/task.service';
import {GlobalStateService} from '../index/global-state.service';
import {SelectedTaskService} from './selected-task.service';

const emptyProvider = {};

describe('SelectedTaskService', () => {
  let service: SelectedTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SelectedTaskService,
        {provide: TaskService, useValue: emptyProvider},
        {provide: GlobalStateService, useValue: emptyProvider},
      ],
    });
    service = TestBed.inject(SelectedTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
