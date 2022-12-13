import { TestBed } from '@angular/core/testing';

import { TransitionHooksService } from './transition-hooks.service';

describe('TransitionHooksService', () => {
  let service: TransitionHooksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransitionHooksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
