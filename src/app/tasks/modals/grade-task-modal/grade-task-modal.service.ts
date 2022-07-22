import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GradeTaskModalComponent } from './grade-task-modal.component';

@Injectable({
  providedIn: 'root',
})
export class GradeTaskModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dialog
        .open(GradeTaskModalComponent, {
          data: {
            task: task,
          },
        })
        .afterClosed()
        .subscribe((result) => {
          resolve(result);
        });
    });
  }
}
