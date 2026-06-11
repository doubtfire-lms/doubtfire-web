import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TaskComment} from 'src/app/api/models/doubtfire-model';
import {CommentsModalComponent, CommentsModalData} from './comments-modal.component';

@Injectable({
  providedIn: 'root',
})
export class CommentsModalService {
  constructor(public dialog: MatDialog) {}

  public show(commentResourceUrl: string, comment: TaskComment) {
    this.dialog.open<CommentsModalComponent, CommentsModalData>(CommentsModalComponent, {
      data: {commentResourceUrl, comment},
      width: '100%',
      maxWidth: '900px',
      panelClass: 'overflow-y-auto',
    });
  }
}
