import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GradeService} from 'src/app/common/services/grade.service';
import {GradeIconComponent} from './grade-icon.component';

describe('GradeIconComponent', () => {
  let component: GradeIconComponent;
  let fixture: ComponentFixture<GradeIconComponent>;
  let gradeService: GradeService;

  beforeEach(async () => {
    gradeService = new GradeService();

    await TestBed.configureTestingModule({
      declarations: [GradeIconComponent],
      providers: [{provide: GradeService, useValue: gradeService}],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the default icon when the grade is undefined', () => {
    component.grade = undefined;
    component.ngOnInit();

    expect(component.gradeText).toEqual('Grade');
    expect(component.gradeLetter).toEqual('G');
  });

  it('should show the default icon when given invalid input', () => {
    component.grade = 'Tomato';
    component.ngOnInit();

    expect(component.gradeText).toEqual('Grade');
    expect(component.gradeLetter).toEqual('G');
  });

  it('should set the grade when passed a grade name', () => {
    Object.entries(gradeService.gradeIndex).forEach(([grade, value]) => {
      component.grade = grade;
      component.ngOnInit();

      expect(component.gradeText).toEqual(grade);
      expect(component.gradeLetter).toEqual(gradeService.gradeAcronyms[value]);
    });
  });

  it('should set the grade when passed a numeric grade', () => {
    gradeService.allGradeValues.forEach((grade) => {
      component.grade = grade;
      component.ngOnInit();

      expect(component.gradeText).toEqual(gradeService.grades[grade]);
      expect(component.gradeLetter).toEqual(gradeService.gradeAcronyms[grade]);
    });
  });
});
