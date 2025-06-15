import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GradeTaskModalComponent } from './grade-task-modal.component';
import { Task } from 'src/app/api/models/doubtfire-model';

@Injectable({
  providedIn: 'root',
})
export class GradeTaskModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task, successCallback: (response: {grade: number, qualityPts: number}) => void, errorCallback: () => void): void {
    this.dialog
      .open(GradeTaskModalComponent, {
        data: {
          task: task
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          successCallback(result);
        } else {
          errorCallback();
        }
      });
  }
}
