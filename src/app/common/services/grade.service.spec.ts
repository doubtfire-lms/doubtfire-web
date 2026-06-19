import {beforeEach, describe, expect, it} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {GradeService} from './grade.service';

describe('GradeService', () => {
  let service: GradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GradeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
