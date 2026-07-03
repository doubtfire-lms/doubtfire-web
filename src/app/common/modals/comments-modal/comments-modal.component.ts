import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TaskComment} from 'src/app/api/models/doubtfire-model';
import {fPdfViewerComponent} from '../../pdf-viewer/pdf-viewer.component';

export interface CommentsModalData {
  comment: TaskComment;
  commentResourceUrl: string;
}

@Component({
  selector: 'comments-modal',
  templateUrl: './comments-modal.component.html',
  styleUrls: ['./comments-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [fPdfViewerComponent],
})
export class CommentsModalComponent implements OnInit {
  @Input() taskComment: TaskComment;
  @Input() commentResourceUrl: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CommentsModalData) {}

  ngOnInit(): void {
    this.taskComment = this.data.comment;
    this.commentResourceUrl = this.data.commentResourceUrl;
  }
}
