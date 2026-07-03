import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatTooltip} from '@angular/material/tooltip';
import {GradeService, Task} from 'src/app/api/models/doubtfire-model';
import {GradeIconComponent} from '../../../common/grade-icon/grade-icon.component';

@Component({
  selector: 'grade-task-modal',
  templateUrl: './grade-task-modal.component.html',
  styleUrls: ['./grade-task-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButtonToggleGroup,
    FormsModule,
    MatButtonToggle,
    MatTooltip,
    GradeIconComponent,
    MatSlider,
    MatSliderThumb,
    MatCardActions,
    MatButton,
    MatDialogClose,
  ],
})
export class GradeTaskModalComponent implements OnInit {
  task: Task;
  gradeValues: number[];

  // Task Rating
  totalRating: number;
  rating: number;
  ratingLabel: string;
  qualityRatingSelected: boolean;

  // Grade Select
  selectedGrade: number;

  constructor(
    public dialogRef: MatDialogRef<GradeTaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: {task: Task},
    private gradeService: GradeService,
  ) {}

  ngOnInit(): void {
    this.task = this.dialogData.task;
    this.rating = this.task.qualityPts > 0 ? this.task.qualityPts : 0;
    this.qualityRatingSelected = this.task.qualityPts >= 0;
    this.selectedGrade = this.task.grade || 0;
    this.totalRating = this.task.definition.maxQualityPts || 5;
    this.gradeValues = this.gradeService.allGradeValuesFor(this.task.unit);
    this.updateRatingLabel();
  }

  gradeName(grade: number): string {
    return this.gradeService.gradeLabel(grade, this.task.unit);
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
      (this.task.definition.maxQualityPts > 0 && this.qualityRatingSelected)
    );
  }

  updateRating(value: number): void {
    if (value >= 0 && value <= this.totalRating) {
      this.rating = value;
      this.qualityRatingSelected = true;
      this.updateRatingLabel();
    }
  }

  updateRatingLabel(): void {
    this.ratingLabel = `${this.rating} / ${this.totalRating}`;
  }

  updateGrade(grade: number | string): void {
    const gradeValue = Number(grade);
    if (this.gradeValues.includes(gradeValue)) {
      this.selectedGrade = gradeValue;
    }
  }
}
