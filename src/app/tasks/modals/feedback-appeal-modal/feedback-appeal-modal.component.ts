import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {AlertService} from 'src/app/common/services/alert.service';
import {FeedbackAppealModalData} from './feedback-appeal-modal.service';

@Component({
  selector: 'f-feedback-appeal-modal',
  templateUrl: './feedback-appeal-modal.component.html',
  styleUrl: './feedback-appeal-modal.component.scss',
})
export class FeedbackAppealModalComponent implements OnInit {
  task: Task;

  constructor(
    public dialogRef: MatDialogRef<FeedbackAppealModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FeedbackAppealModalData,
    private alerts: AlertService,
  ) {}

  ngOnInit() {
    this.task = this.data.task;
  }

  submit(): void {
    this.task.requestFeedbackReview().subscribe({
      next: (_response) => {
        this.alerts.success(`Requested feedback review for this task!`, 3000);
      },
      error: (error) => {
        this.alerts.error(`An error occurred: ${error}`, 3000);
      },
    });
    this.dismissModal();
  }

  public dismissModal() {
    this.dialogRef.close();
  }
}
