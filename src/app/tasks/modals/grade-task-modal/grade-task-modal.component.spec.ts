import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {GradeService} from 'src/app/common/services/grade.service';
import {GradeTaskModalComponent} from './grade-task-modal.component';

describe('GradeTaskModalComponent', () => {
  let component: GradeTaskModalComponent;
  let fixture: ComponentFixture<GradeTaskModalComponent>;
  let gradeServiceStub: GradeService;
  let dialogRefMock: {close: () => void};
  let dialogDataStub: {
    task: {
      grade?: number;
      qualityPts?: number;
      definition: {maxQualityPts?: number};
    };
  };

  beforeEach(async () => {
    gradeServiceStub = new GradeService();

    dialogDataStub = {
      task: {
        grade: undefined,
        qualityPts: undefined,
        definition: {
          maxQualityPts: undefined,
        },
      },
    };

    dialogRefMock = {
      close: () => {
        /* empty */
      },
    };

    await TestBed.configureTestingModule({
      declarations: [GradeTaskModalComponent],
      providers: [
        {provide: GradeService, useValue: gradeServiceStub},
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: MAT_DIALOG_DATA, useValue: dialogDataStub},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return rating & grade when closed', () => {
    vi.spyOn(component.dialogRef, 'close');

    component.rating = 5;
    component.selectedGrade = 2;
    component.close();

    expect(component.dialogRef.close).toHaveBeenCalledWith({
      qualityPts: 5,
      selectedGrade: 2,
    });
  });

  it('should dismiss', () => {
    vi.spyOn(component.dialogRef, 'close');
    component.dismiss();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  /**
   * For Rating tasks
   */
  it('should accept a new task object', () => {
    const newRatingTask = {
      grade: undefined,
      qualityPts: 5,
      definition: {
        maxQualityPts: 10,
      },
    };
    dialogDataStub.task = newRatingTask;

    component.ngOnInit();
    expect(component.task).toEqual(newRatingTask);
    expect(component.rating).toEqual(newRatingTask.qualityPts);
    expect(component.selectedGrade).toEqual(0);
    expect(component.totalRating).toEqual(newRatingTask.definition.maxQualityPts);
  });

  it('should treat an unrated quality task as unselected in the modal', () => {
    dialogDataStub.task = {
      grade: undefined,
      qualityPts: -1,
      definition: {
        maxQualityPts: 5,
      },
    };

    component.ngOnInit();

    expect(component.rating).toEqual(0);
    expect(component.ratingLabel).toEqual('0 / 5');
    expect(component.qualityRatingSelected).toBe(false);
    expect(component.isValid()).toBe(false);
  });

  it('should allow 0 as a selected quality rating', () => {
    dialogDataStub.task = {
      grade: undefined,
      qualityPts: -1,
      definition: {
        maxQualityPts: 5,
      },
    };

    component.ngOnInit();
    component.updateRating(0);

    expect(component.rating).toEqual(0);
    expect(component.qualityRatingSelected).toBe(true);
    expect(component.isValid()).toBe(true);
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
    expect(component.selectedGrade).toEqual(0);

    component.updateGrade(-10);
    expect(component.selectedGrade).toEqual(0);
  });
});
