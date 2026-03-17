import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GradeTaskModalComponent } from './grade-task-modal.component';
import { gradeService } from 'src/app/ajs-upgraded-providers';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('GradeTaskModalComponent', () => {
  let component: GradeTaskModalComponent;
  let fixture: ComponentFixture<GradeTaskModalComponent>;
  let gradeServiceStub: jasmine.SpyObj<any>;
  let dialogRefMock: jasmine.SpyObj<any>;
  let dialogDataStub: jasmine.SpyObj<any>;

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
        allGradeValues: [-1, 0, 1, 2, 3],
      };
      gradeServiceStub.grades[-1] = 'Fail';
      gradeServiceStub.gradeAcronyms[-1] = 'F';

      dialogDataStub = {
        task: {
          grade: undefined,
          quality_pts: undefined,
          definition: {
            max_quality_pts: undefined,
          },
        },
      };

      dialogRefMock = {
        close: () => {},
      };

      TestBed.configureTestingModule({
        declarations: [GradeTaskModalComponent],
        providers: [
          { provide: gradeService, useValue: gradeServiceStub },
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: dialogDataStub },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return rating & grade when closed', () => {
    spyOn(component.dialogRef, 'close');

    component.rating = 5;
    component.selectedGrade = 2;
    component.close();

    expect(component.dialogRef.close).toHaveBeenCalledWith({
      qualityPts: 5,
      selectedGrade: 2,
    });
  });

  it('should dismiss', () => {
    spyOn(component.dialogRef, 'close');
    component.dismiss();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  /**
   * For Rating tasks
   */
  it('should accept a new task object', () => {
    const newRatingTask = {
      grade: undefined,
      quality_pts: 5,
      definition: {
        max_quality_pts: 10,
      },
    };
    dialogDataStub.task = newRatingTask;

    component.ngOnInit();
    expect(component.task).toEqual(newRatingTask);
    expect(component.rating).toEqual(newRatingTask.quality_pts);
    expect(component.selectedGrade).toEqual(newRatingTask.grade);
    expect(component.totalRating).toEqual(newRatingTask.definition.max_quality_pts);
  });

  it('should not allow a rating higher than the max rating', () => {
    component.ngOnInit();
    component.rating = 1;
    component.totalRating = 10;
    component.updateRating(20);

    expect(component.rating).toEqual(1);
    expect(component.totalRating).toEqual(10);
  });

  it('should not allow a rating lower than 0', () => {
    component.ngOnInit();
    component.totalRating = 10;
    component.updateRating(-10);

    expect(component.rating).toEqual(0);
    expect(component.totalRating).toEqual(10);
  });

  it('should accept a new valid rating', () => {
    component.ngOnInit();
    component.totalRating = 10;
    component.updateRating(9);

    expect(component.rating).toEqual(9);
    expect(component.totalRating).toEqual(10);
  });

  it('should reflect the rating in the rating label', () => {
    component.ngOnInit();
    expect(component.ratingLabel).toEqual('0 / 5');

    component.updateRating(-1);
    expect(component.ratingLabel).toEqual('0 / 5');

    component.updateRating(12);
    expect(component.ratingLabel).toEqual('0 / 5');

    component.updateRating(2);
    expect(component.ratingLabel).toEqual('2 / 5');

    component.updateRating(5);
    expect(component.ratingLabel).toEqual('5 / 5');
  });

  /**
   * For Graded Tasks
   */
  it('should accept a new valid grade', () => {
    component.ngOnInit();
    component.updateGrade(3);
    expect(component.selectedGrade).toEqual(3);
  });

  it('should not accept a new invalid grade', () => {
    component.ngOnInit();
    component.updateGrade(10);
    expect(component.selectedGrade).toEqual(undefined);

    component.updateGrade(-10);
    expect(component.selectedGrade).toEqual(undefined);
  });
});
