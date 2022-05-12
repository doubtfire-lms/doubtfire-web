import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { gradeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'grade-task-modal',
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

  // Grade Select
  selectedGrade: number;

  constructor(
    public dialogRef: MatDialogRef<GradeTaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Inject(gradeService) private gradeService: any
  ) { }

  ngOnInit(): void {
    this.task = this.dialogData.task;
    this.rating = this.task.quality_pts || 1;
    this.totalRating = this.task.definition.max_quality_pts || 5;
    this.gradeValues = this.gradeService.allGradeValues;
    this.grades = this.gradeService.grades;
  }

  dismiss() {
    this.dialogRef.close();
  }

  close() {
    // Pass values back to service
    this.dialogRef.close({
      qualityPts: this.rating,
      selectedGrade: this.selectedGrade
    });
  }

  updateRating(value: number) {
    if (value <= this.totalRating) {
      this.rating = value;
    }
  }

  updateGrade(grade: number) {
    if (this.gradeValues.includes(Number(grade))) {
      this.selectedGrade = grade;
    }
  }

}
