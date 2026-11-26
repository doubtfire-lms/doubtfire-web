import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-existing-submission-choice-modal',
  templateUrl: './existing-submission-choice-modal.component.html',
  styleUrls: ['./existing-submission-choice-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ExistingSubmissionChoiceModalComponent {
  public busy = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public task: Task,
    private dialogRef: MatDialogRef<ExistingSubmissionChoiceModalComponent, 'upload' | undefined>,
    private taskService: TaskService,
    private alertService: AlertService,
  ) {}

  public useExistingSubmission(): void {
    if (this.busy) {
      return;
    }

    this.busy = true;
    this.taskService
      .update(
        {projectId: this.task.project.id, taskDefId: this.task.definition.id},
        {
          entity: this.task,
          cache: this.task.project.taskCache,
          body: {trigger: 'ready_for_feedback', reuse_existing_submission: true},
        },
      )
      .subscribe({
        next: () => {
          this.task.processTaskStatusChange('ready_for_feedback', this.alertService);
          this.dialogRef.close();
        },
        error: (error) => {
          this.busy = false;
          this.alertService.error(error, 6000);
        },
      });
  }

  public uploadNewSubmission(): void {
    if (!this.busy) {
      this.dialogRef.close('upload');
    }
  }
}
