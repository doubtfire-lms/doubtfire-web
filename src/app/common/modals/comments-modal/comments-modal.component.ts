import {Component, Input, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TaskComment} from 'src/app/api/models/doubtfire-model';

export interface CommentsModalData {
  comment: TaskComment;
  commentResourceUrl: string;
}

@Component({
  selector: 'comments-modal',
  templateUrl: './comments-modal.component.html',
  styleUrls: ['./comments-modal.component.scss'],
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
