import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface CommentsModalData {
  comment: {commentType: string};
  commentResourceUrl: string;
}

@Component({
  selector: 'comments-modal',
  templateUrl: './comments-modal.component.html',
  styleUrls: ['./comments-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CommentsModalComponent implements OnInit {
  @Input() taskComment: {commentType: string};
  @Input() commentResourceUrl: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CommentsModalData) {}

  ngOnInit(): void {
    this.taskComment = this.data.comment;
    this.commentResourceUrl = this.data.commentResourceUrl;
  }
}
