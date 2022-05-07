import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { gradeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'grade-task-modal',
  templateUrl: './grade-task-modal.component.html',
  styleUrls: ['./grade-task-modal.component.scss'],
})
export class GradeTaskModalComponent implements OnInit {
  @Input() task: any;
  @Input() data: any;

  totalRating;
  newRating = 1;
  gradeValues;
  grades;

  constructor(
    public dialogRef: MatDialogRef<GradeTaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Inject(gradeService) private gradeService: any
  ) { }

  ngOnInit(): void {
    this.task = this.dialogData.task;

    this.data = {
      desiredGrade: this.task.grade,
      rating: this.task.quality_pts || 1,
      overStar: 0,
      confRating: 0
    };

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
      qualityPts: this.newRating,
      selectedGrade: this.data.desiredGrade
    });
  }

  updateRating(value: number) {
    this.newRating = value;
  }

}
