import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {FeedbackAppealModalData} from './feedback-appeal-modal.service';

@Component({
  selector: 'f-feedback-appeal-modal',
  templateUrl: './feedback-appeal-modal.component.html',
  styleUrl: './feedback-appeal-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatHint,
    MatDialogActions,
    MatButton,
  ],
})
export class FeedbackAppealModalComponent implements OnInit {
  task: Task;

  reviewComment: string;
  submitting: boolean;

  constructor(
    public dialogRef: MatDialogRef<FeedbackAppealModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FeedbackAppealModalData,
    private alerts: AlertService,
    private taskService: TaskService,
  ) {}

  ngOnInit() {
    this.task = this.data.task;
  }

  submit(): void {
    this.submitting = true;
    this.task.requestFeedbackReview().subscribe({
      next: (_response) => {
        this.alerts.success(
          `Requested feedback review for ${this.task.definition.abbreviation} ${this.task.definition.name}`,
          3000,
        );
        setTimeout(() => {
          // Fetch the "Feedback Review Requested" comment
          this.taskService.notifyStatusChange(this.task);
          setTimeout(() => {
            this.task.addComment(this.reviewComment);
          }, 250);
          this.dismissModal();
        }, 250);
      },
      error: (error) => {
        this.alerts.error(`An error occurred: ${error}`, 3000);
        this.submitting = false;
      },
    });
  }

  public dismissModal() {
    this.dialogRef.close();
  }
}
