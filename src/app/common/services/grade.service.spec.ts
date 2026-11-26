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

  it('uses all target grades when a unit has no custom configuration', () => {
    expect(service.gradeValuesFor()).toEqual([0, 1, 2, 3]);
  });

  it('uses the grades enabled for a unit', () => {
    const unit = {gradeValues: [0]};

    expect(service.gradeValuesFor(unit)).toEqual([0]);
    expect(service.allGradeValuesFor(unit)).toEqual([-1, 0]);
    expect(service.gradeViewDataFor(unit, true)).toEqual([
      {value: -1, viewValue: 'Fail'},
      {value: 0, viewValue: 'Pass'},
    ]);
  });
});
