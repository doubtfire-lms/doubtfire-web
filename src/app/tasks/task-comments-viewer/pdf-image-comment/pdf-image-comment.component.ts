import { Component, OnInit, Input, Inject } from '@angular/core';
import { alertService, commentsModal } from 'src/app/ajs-upgraded-providers';
import { Project, TaskComment, Task } from 'src/app/api/models/doubtfire-model';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader';

@Component({
  selector: 'pdf-image-comment',
  templateUrl: './pdf-image-comment.component.html',
  styleUrls: [],
})
export class PdfImageCommentComponent implements OnInit {
  @Input() comment: TaskComment;
  @Input() project: Project;
  @Input() task: Task;

  public resourceUrl: string = undefined;

  constructor(
    @Inject(alertService) private alerts: any,
    @Inject(commentsModal) private commentsModalRef: any,
    private fileDownloaderService: FileDownloaderService,
  ) {}

  ngOnInit() {
    if (this.comment.commentType === 'image') this.downloadCommentResource();
  }

  private downloadCommentResource(fn?: (url: string) => void) {
    const url = this.comment.attachmentUrl;

    this.fileDownloaderService.downloadBlob(
      url,
      ((blobUrl, response) => {
        this.resourceUrl = blobUrl;
        if (fn) fn(blobUrl);
      }).bind(this),
      ((error) => this.alerts.add('danger', `Unable to download image comment. ${error}`, 6000)).bind(this)
    );
  }

  public openCommentsModal() {
    if (this.resourceUrl) {
      this.commentsModalRef.show(this.resourceUrl, this.comment.commentType);
    } else {
      this.downloadCommentResource(this.openCommentsModal.bind(this));
    }
  }
}
