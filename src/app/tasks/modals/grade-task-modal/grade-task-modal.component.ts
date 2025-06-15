import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task, GradeService } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'grade-task-modal',
  templateUrl: './grade-task-modal.component.html',
  styleUrls: ['./grade-task-modal.component.scss'],
})
export class GradeTaskModalComponent implements OnInit {
  task: Task;
  gradeValues: number[];

  // Task Rating
  totalRating: number;
  rating: number;
  ratingLabel: string;

  // Grade Select
  selectedGrade: number;

  constructor(
    public dialogRef: MatDialogRef<GradeTaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: {task: Task},
    private gradeService: GradeService
  ) {}

  ngOnInit(): void {
    this.task = this.dialogData.task;
    this.rating = this.task.qualityPts || 0;
    this.selectedGrade = this.task.grade || 0;
    this.totalRating = this.task.definition.maxQualityPts || 5;
    this.gradeValues = this.gradeService.allGradeValues;
    this.updateRatingLabel();
  }

  gradeName(grade: number): string {
    return this.gradeService.grades[grade];
  }

  dismiss(): void {
    this.dialogRef.close();
  }

  close(): void {
    // Pass values back to service
    this.dialogRef.close({
      qualityPts: this.rating,
      selectedGrade: this.selectedGrade,
    });
  }

  isValid() {
    return (
      (this.task.definition.isGraded && this.selectedGrade) ||
      (this.task.definition.maxQualityPts > 0 && this.rating)
    );
  }

  updateRating(value: number): void {
    if (value >= 0 && value <= this.totalRating) {
      this.rating = value;
      this.updateRatingLabel();
    }
  }

  updateRatingLabel(): void {
    this.ratingLabel = `${this.rating} / ${this.totalRating}`;
  }

  updateGrade(grade: number | string): void {
    const gradeValue = Number(grade)
    if (this.gradeValues.includes(gradeValue)) {
      this.selectedGrade = gradeValue;
    }
  }
}
