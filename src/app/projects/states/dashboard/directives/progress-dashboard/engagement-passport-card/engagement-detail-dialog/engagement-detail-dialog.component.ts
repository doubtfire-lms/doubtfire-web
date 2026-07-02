import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {
  Engagement,
  EngagementComment,
  EngagementCommentService,
  EngagementService,
} from 'src/app/api/models/doubtfire-model';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-engagement-detail-dialog',
  templateUrl: './engagement-detail-dialog.component.html',
  styleUrl: './engagement-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EngagementDetailDialogComponent implements OnInit, OnDestroy {
  @ViewChild('commentsEnd') commentsEnd?: ElementRef<HTMLElement>;

  engagement: Engagement;
  commentText = '';
  loading = true;
  loadFailed = false;
  submitting = false;
  replyingToComment?: EngagementComment;
  hoveredCommentId?: number;
  editingComment?: EngagementComment;
  editingCommentText = '';
  evidenceBlobUrl?: string;
  evidenceLoading = false;
  evidenceLoadFailed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: {engagement: Engagement},
    private engagementService: EngagementService,
    private engagementCommentService: EngagementCommentService,
    private fileDownloader: FileDownloaderService,
    private alerts: AlertService,
    private confirmationModal: ConfirmationModalService,
  ) {
    this.engagement = data.engagement;
  }

  get comments(): readonly EngagementComment[] {
    return [...this.engagement.comments].sort(
      (first, second) => first.createdAt.getTime() - second.createdAt.getTime(),
    );
  }

  ngOnInit(): void {
    this.engagementService.loadEngagement(this.engagement).subscribe({
      next: (engagement) => {
        this.engagement = engagement;
        this.loading = false;
        this.loadAttachment();
        this.scrollToBottom();
      },
      error: () => {
        this.loadFailed = true;
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.evidenceBlobUrl) {
      this.fileDownloader.releaseBlob(this.evidenceBlobUrl);
    }
  }

  openAttachment(): void {
    if (this.evidenceBlobUrl) {
      window.open(this.evidenceBlobUrl, '_blank', 'noopener,noreferrer');
    }
  }

  submitComment(): void {
    const comment = this.commentText.trim();
    if (!comment || this.submitting) {
      return;
    }

    this.submitting = true;
    this.engagementCommentService
      .addComment(this.engagement, comment, this.replyingToComment)
      .subscribe({
        next: () => {
          this.commentText = '';
          this.submitting = false;
          this.replyingToComment = undefined;
          this.scrollToBottom();
        },
        error: (error) => {
          this.submitting = false;
          this.alerts.error(error?.error ?? 'Unable to add your comment.');
        },
      });
  }

  replyToComment(comment: EngagementComment): void {
    this.replyingToComment = comment;
  }

  cancelReply(): void {
    this.replyingToComment = undefined;
  }

  editComment(comment: EngagementComment): void {
    if (!comment.currentUserCanEdit) {
      return;
    }

    this.editingComment = comment;
    this.editingCommentText = comment.comment;
  }

  cancelEdit(): void {
    this.editingComment = undefined;
    this.editingCommentText = '';
  }

  updateComment(): void {
    const text = this.editingCommentText.trim();
    if (!this.editingComment || !text) {
      return;
    }

    this.engagementCommentService.updateComment(this.editingComment, text).subscribe({
      next: () => this.cancelEdit(),
      error: (error) => this.alerts.error(error?.error ?? 'Unable to update this comment.'),
    });
  }

  deleteComment(comment: EngagementComment): void {
    if (!comment.currentUserCanDelete) {
      return;
    }

    this.confirmationModal.show(
      'Delete comment',
      'Are you sure you want to delete this engagement comment?',
      () => {
        this.engagementCommentService.deleteComment(comment).subscribe({
          next: () => {
            if (this.replyingToComment?.id === comment.id) {
              this.cancelReply();
            }
          },
          error: (error) => this.alerts.error(error?.error ?? 'Unable to delete this comment.'),
        });
      },
    );
  }

  scrollToComment(comment?: EngagementComment): void {
    if (!comment) {
      return;
    }

    const element = document.getElementById(`engagement-comment-${comment.id}`);
    element?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }

  private loadAttachment(): void {
    if (!this.engagement.hasAttachment) {
      return;
    }

    this.evidenceLoading = true;
    this.fileDownloader.downloadBlob(
      this.engagement.attachmentUrl,
      (blobUrl) => {
        this.evidenceBlobUrl = blobUrl;
        this.evidenceLoading = false;
        this.scrollToBottom();
      },
      () => {
        this.evidenceLoadFailed = true;
        this.evidenceLoading = false;
      },
    );
  }

  scrollToBottom(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = this.commentsEnd?.nativeElement.closest(
          '.mat-mdc-dialog-content',
        ) as HTMLElement | null;
        container?.scrollTo({top: container.scrollHeight});
      });
    });
  }
}
