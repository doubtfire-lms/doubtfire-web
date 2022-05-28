import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { gradeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'df-grade-task-modal',
  templateUrl: './grade-task-modal.component.html',
  styleUrls: ['./grade-task-modal.component.scss'],
})
export class GradeTaskModalComponent implements OnInit {
  task: any;
  gradeValues: [number];
  grades: [string];

  // Task Rating
  totalRating: number;
  rating: number;
  ratingLabel: string;

  // Grade Select
  selectedGrade: number;

  constructor(
    public dialogRef: MatDialogRef<GradeTaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Inject(gradeService) private gradeService: any
  ) {}

  ngOnInit(): void {
    this.task = this.dialogData.task;
    this.rating = this.task.quality_pts || 0;
    this.totalRating = this.task.definition.max_quality_pts || 5;
    this.gradeValues = this.gradeService.allGradeValues;
    this.grades = this.gradeService.grades;
    this.updateRatingLabel();
  }

  dismiss() {
    this.dialogRef.close();
  }

  close() {
    // Pass values back to service
    this.dialogRef.close({
      qualityPts: this.rating,
      selectedGrade: this.selectedGrade,
    });
  }

  isValid() {
    return (
      (this.task.definition.is_graded && this.selectedGrade) ||
      (this.task.definition.max_quality_pts > 0 && this.rating)
    );
  }

  updateRating(value: number) {
    if (value >= 0 && value <= this.totalRating) {
      this.rating = value;
      this.updateRatingLabel();
    }
  }

  updateRatingLabel() {
    this.ratingLabel = `${this.rating} / ${this.totalRating}`;
  }

  updateGrade(grade: number) {
    if (this.gradeValues.includes(Number(grade))) {
      this.selectedGrade = grade;
    }
  }
}
