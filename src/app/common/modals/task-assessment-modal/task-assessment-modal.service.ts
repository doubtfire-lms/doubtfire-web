import { Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {TaskAssessmentModalComponent} from './task-assessment-modal.component';
import { TaskAssessmentResult } from '../../services/task-submission.service';
import { TaskSubmissionHistoryComponent } from 'src/app/tasks/task-submission-history/task-submission-history.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Injectable({
  providedIn: 'root'
})
export class TaskAssessmentModalService {


  constructor(
    // public dialog: MatDialog,
    private modalService: NzModalService) { }

  // // Old implentation
  // public show(assessmentResult: TaskAssessmentResult) {
  //   let dialogRef: MatDialogRef<TaskAssessmentModalComponent, any>;
  //   dialogRef = this.dialog.open(TaskAssessmentModalComponent, {
  //     data: assessmentResult,
  //   });
  // }

  createComponentModal(task: any): void {
    const modal = this.modalService.create({
      nzTitle: 'Submission History',
      nzContent: TaskAssessmentModalComponent,
      nzComponentParams: {
        task: task,
      },
      //nzWrapClassName: 'submission-history-modal',
      nzWidth: '80%',
      nzStyle: { top: '20px',
                 height: '95vh',
                  // display: 'flex',
                  // flex: 1,
               },
      // // Not a great idea to provide a React-style blocks of template inside the code, but it's possible.
      // nzFooter: [
      //   {
      //     label: 'change component title from outside',
      //     onClick: componentInstance => {
      //       componentInstance!.title = 'title changed';
      //     }
      //   }
      // ]
    });
  }

}
