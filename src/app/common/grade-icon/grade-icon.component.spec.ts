import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GradeIconComponent } from './grade-icon.component';
import { gradeService } from 'src/app/ajs-upgraded-providers';

describe('GradeIconComponent', () => {
  let component: GradeIconComponent;
  let fixture: ComponentFixture<GradeIconComponent>;
  let gradeServiceStub: jasmine.SpyObj<any>;

  beforeEach(
    waitForAsync(() => {
      gradeServiceStub = {
        grades: ['Pass', 'Credit', 'Distinction', 'High Distinction'],
        gradeAcronyms: {
          Fail: 'F',
          Pass: 'P',
          Credit: 'C',
          Distinction: 'D',
          'High Distinction': 'HD',
          0: 'P',
          1: 'C',
          2: 'D',
          3: 'HD',
        },
      };

      gradeServiceStub.grades[-1] = 'Fail';
      gradeServiceStub.gradeAcronyms[-1] = 'F';

      TestBed.configureTestingModule({
        declarations: [GradeIconComponent],
        providers: [{ provide: gradeService, useValue: gradeServiceStub }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the index value when undefined', () => {
    component.index = undefined;
    component.ngOnInit();

    expect(component.index).toEqual(-1);
  });

  it('should set the grade to Fail when given invalid input', () => {
    component.index = undefined;
    component.grade = 'Tomato';
    component.ngOnInit();

    expect(component.index).toEqual(-1);
    expect(component.gradeText).toEqual('Fail');
    expect(component.gradeLetter).toEqual('F');
  });

  it('should appropriate set the grade when passed a grade value', () => {
    gradeServiceStub.grades.forEach((grade: string) => {
      component.grade = grade;
      component.index = undefined;
      component.ngOnInit();

      expect(component.index).toEqual(gradeServiceStub.grades.indexOf(grade));
      expect(component.gradeText).toEqual(grade);
      expect(component.gradeLetter).toEqual(gradeServiceStub.gradeAcronyms[grade]);
    });
  });

  it('should appropriate set the grade when passed a grade index', () => {
    gradeServiceStub.grades.forEach((_, index: number) => {
      component.index = index - 1;
      component.ngOnInit();

      expect(component.index).toEqual(index - 1);
      expect(component.gradeText).toEqual(gradeServiceStub.grades[component.index]);
      expect(component.gradeLetter).toEqual(gradeServiceStub.gradeAcronyms[component.gradeText]);
    });
  });
});
