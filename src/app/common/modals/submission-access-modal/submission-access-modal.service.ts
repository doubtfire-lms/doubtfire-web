import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {SubmissionAccessModalComponent} from './submission-access-modal.component';

@Injectable({
  providedIn: 'root',
})
export class SubmissionAccessModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task, afterApplication?: () => void): void {
    this.dialog.open(SubmissionAccessModalComponent, {
      data: {task, afterApplication},
    });
  }
}
