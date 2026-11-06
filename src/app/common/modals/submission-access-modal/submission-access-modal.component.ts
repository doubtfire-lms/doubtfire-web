import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {finalize} from 'rxjs/operators';
import {Task} from 'src/app/api/models/task';
import {TaskCommentService} from 'src/app/api/services/task-comment.service';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'f-submission-access-modal',
  templateUrl: './submission-access-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionAccessModalComponent {
  protected reasonMinLength = 15;
  protected reasonMaxLength = 256;
  submissionData = new FormGroup({
    submissionReason: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(this.reasonMinLength),
        Validators.maxLength(this.reasonMaxLength),
      ],
    }),
  });
  submitting = false;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {task: Task; afterApplication?: () => void},
    private dialogRef: MatDialogRef<SubmissionAccessModalComponent>,
    private comments: TaskCommentService,
    private alerts: AlertService,
  ) {}

  submitApplication(): void {
    const reason = this.submissionData.controls.submissionReason;
    reason.setValue(reason.value.trim());
    reason.markAsTouched();
    if (this.submissionData.invalid || this.submitting) return;
    if (this.data.task.blockedByPrerequisiteTasks()) {
      this.error = 'You must satisfy the prerequisite tasks before requesting submission access.';
      return;
    }
    if (!this.data.task.canApplyForSubmissionAccess()) {
      this.error =
        this.data.task.submissionAccessRequestError ||
        'Submission access cannot be requested for this task.';
      return;
    }
    this.submitting = true;
    this.error = null;
    this.comments
      .requestSubmissionAccess(reason.value, this.data.task)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.data.task.submissionAccessRequestError =
            'A submission access request is already awaiting assessment.';
          this.data.afterApplication?.();
          this.alerts.success('Submission access requested.', 2000);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.error =
            error?.error?.error || error?.data?.error || error?.message ||
            (typeof error === 'string' ? error : 'Unable to request submission access.');
        },
      });
  }
}
