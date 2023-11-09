import { TestBed } from '@angular/core/testing';

import { TiiService } from './tii.service';

describe('TiiServiceService', () => {
  let service: TiiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
