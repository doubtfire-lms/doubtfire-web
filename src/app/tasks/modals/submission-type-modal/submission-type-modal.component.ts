import {Component, Inject} from '@angular/core';
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
})
export class SubmissionTypeModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SubmissionTypeModalData,
    private dialogRef: MatDialogRef<SubmissionTypeModalComponent>,
  ) {}

  triggerTransition(status: TaskStatusEnum) {
    this.data.task.triggerTransition(status);
    this.dismissModal();
  }

  private dismissModal() {
    this.dialogRef.close();
  }
}
