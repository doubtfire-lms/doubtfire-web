import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {TaskDefinition, Unit} from 'src/app/api/models/doubtfire-model';

export interface BatchFeedbackWorkflowDialogData {
  unit: Unit;
  taskDefinition?: TaskDefinition;
  myStudentsOnly?: boolean;
}

@Component({
  selector: 'f-batch-feedback-workflow-dialog',
  templateUrl: './batch-feedback-workflow-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatIcon, MatDialogActions, MatButton],
})
export class BatchFeedbackWorkflowDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BatchFeedbackWorkflowDialogData,
    private dialogRef: MatDialogRef<BatchFeedbackWorkflowDialogComponent, {openUpload?: boolean}>,
  ) {}

  get taskLabel(): string {
    if (!this.data.taskDefinition) {
      return this.data.unit.code;
    }

    return `${this.data.taskDefinition.abbreviation} ${this.data.taskDefinition.name}`;
  }

  continueToUpload(): void {
    this.dialogRef.close({openUpload: true});
  }

  close(): void {
    this.dialogRef.close();
  }
}
