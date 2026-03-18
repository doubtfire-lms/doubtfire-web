import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {AlertService} from 'src/app/common/services/alert.service';
import {
  UploadSubmissionModalCloseResult,
  UploadSubmissionModalComponent,
  UploadSubmissionModalData,
  UploadSubmissionModalDismissResult,
  UploadSubmissionModalResult,
} from './upload-submission-modal.component';

export interface UploadSubmissionModalHandle<T = unknown> {
  result: Promise<T>;
}

@Injectable({
  providedIn: 'root',
})
export class UploadSubmissionModalService {
  constructor(
    private dialog: MatDialog,
    private alertService: AlertService,
  ) {}

  public show(
    task: Task,
    reuploadEvidence: boolean,
    isTestSubmission: boolean = false,
  ): UploadSubmissionModalHandle<Task> | null {
    if (!isTestSubmission && task.isGroupTask() && !task.group) {
      this.alertService.error(
        `This is a group task. Join a ${task.definition.groupSet.name} group to submit this task.`,
        8000,
      );
      return null;
    }

    const dialogRef = this.dialog.open<
      UploadSubmissionModalComponent,
      UploadSubmissionModalData,
      UploadSubmissionModalResult
    >(UploadSubmissionModalComponent, {
      autoFocus: false,
      disableClose: true,
      position: {top: '2.5%'},
      width: '100%',
      maxWidth: '960px',
      maxHeight: '95vh',
      data: {
        task,
        reuploadEvidence,
        isTestSubmission,
      },
    });

    return {
      result: new Promise<Task>((resolve, reject) => {
        dialogRef.afterClosed().subscribe((result) => {
          if ((result as UploadSubmissionModalDismissResult | undefined)?.dismissed) {
            reject(result);
            return;
          }

          resolve((result as UploadSubmissionModalCloseResult | undefined)?.value ?? task);
        });
      }),
    };
  }
}
