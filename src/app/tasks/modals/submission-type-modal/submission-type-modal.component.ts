import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {TaskStatusEnum} from 'src/app/api/models/task-status';

export interface SubmissionTypeModalData {
  task: Task;
}

@Component({
  selector: 'f-submission-type-modal',
  templateUrl: './submission-type-modal.component.html',
  styleUrls: ['./submission-type-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionTypeModalComponent {
  selectedTransition: 'ready_for_feedback' | 'assess_in_portfolio' = null;

  public get isPastFeedbackDeadline(): boolean {
    return Date.now() > this.data.task.localDeadlineDate().getTime();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SubmissionTypeModalData,
    private dialogRef: MatDialogRef<SubmissionTypeModalComponent>,
  ) {}

  public selectRff() {
    if (this.isPastFeedbackDeadline) {
      return;
    }

    this.selectedTransition = 'ready_for_feedback';
  }

  public selectAip() {
    this.selectedTransition = 'assess_in_portfolio';
  }

  public submit() {
    if (
      this.selectedTransition === null ||
      (this.selectedTransition === 'ready_for_feedback' && this.isPastFeedbackDeadline)
    ) {
      return;
    }

    this.triggerTransition(this.selectedTransition);
  }

  private triggerTransition(status: TaskStatusEnum) {
    this.data.task.triggerTransition(status);
    this.dismissModal();
  }

  private dismissModal() {
    this.dialogRef.close();
  }
}
