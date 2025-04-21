import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { commentsModal } from 'src/app/ajs-upgraded-providers';
import { Task, Project, TaskComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { TaskCommentComposerData } from '../task-comment-composer/task-comment-composer.component';
import { AlertService } from 'src/app/common/services/alert.service';

@Component({
  selector: 'task-comments-viewer',
  templateUrl: './task-comments-viewer.component.html',
  styleUrls: ['./task-comments-viewer.component.scss'],
})
export class TaskCommentsViewerComponent implements OnChanges, OnInit {
  // Get the comments body from the HTML template
  @ViewChild('commentsBody') commentsBody: ElementRef;

  lastComment: TaskComment;
  project: Project;
  loading: boolean = true;

  sharedCommentComposerData: TaskCommentComposerData = {
    originalComment: null,
  };

  @Input() comment?: TaskComment;
  @Input() task: Task;
  @Input() refocusOnTaskChange: boolean;

  constructor(
    private taskCommentService: TaskCommentService,
    private constants: DoubtfireConstants,
    @Inject(commentsModal) private commentsModalRef: any,
    private alerts: AlertService,
  ) {
    const self = this;
    this.taskCommentService.commentAdded$.subscribe((tc: TaskComment) => {
      self.scrollDown();
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    this.loading = true;

    // Must have project for task to be mapped
    if (changes.task?.currentValue?.project != null) {
      this.project = changes.task.currentValue.project;
      this.taskCommentService
        .query(
          {
            projectId: this.project.id,
            taskDefinitionId: this.task.definition.id,
          },
          this.task,
          {
            cache: this.task.commentCache,
            constructorParams: this.task,
          },
        )
        .subscribe((comments) => {
          // this.task.comments = comments;

          this.task.refreshCommentData();

          const lastReadComment: TaskComment = this.task.comments
            .slice()
            .reverse()
            .find((comment: TaskComment) => comment.recipientReadTime != null && !comment.recipientIsMe);

          setTimeout(() => {
            this.loading = false;
            this.scrollDown();
          }, 1000);

          if (lastReadComment) {
            lastReadComment.lastRead = true;
          }
        });
    } else {
      this.loading = false;
    }
  }

  scrollDown() {
    const component: TaskCommentsViewerComponent = this;
    setTimeout(() => {
      const element = component.commentsBody.nativeElement;
      element.scrollTop = element.scrollHeight;
    }, 50);
  }

  shouldShowReadReceipt() {
    return this.task.comments.slice(-1)[0]?.authorIsMe;
  }

  get overseerEnabled(): boolean {
    return this.constants.IsOverseerEnabled.value;
  }

  get scormEnabled(): boolean {
    return this.task.scormEnabled;
  }

  uploadFiles(event) {
    [...event].forEach((file) => {
      if (
        [
          'audio/mpeg',
          'audio/vorbis',
          'audio/mp4',
          'audio/ogg',
          'audio/wav',
          'audio/x-wav',
          'audio/webm',
          'image/png',
          'image/pdf',
          'application/pdf',
          'image/gif',
          'image/jpg',
          'image/jpeg',
        ].includes(file.type) ||
        file.type.startsWith('audio/') ||
        file.type.startsWith('image/')
      ) {
        this.postAttachmentComment(file);
      } else {
        this.alerts.error('I cannot upload that file - only images, audio, and PDFs.', 4000);
      }
    });
    console.log('implement - check map comments');
    // this.task.comments = this.ts.mapComments(this.task.comments);
  }

  // # Upload image files as comments to a given task
  postAttachmentComment(file) {
    const self: TaskCommentsViewerComponent = this;

    this.taskCommentService.addComment(this.task, file, 'file', null).subscribe(
      (tc: TaskComment) => {},
      (error: any) => {
        this.alerts.error(error || error?.message, 2000);
      },
    );
  }

  scrollToComment(commentID) {
    document.querySelector(`#comment-${commentID}`).scrollIntoView();
  }

  openCommentsModal(comment: TaskComment) {
    const resourceUrl = comment.attachmentUrl;
    this.commentsModalRef.show(resourceUrl, comment.commentType);
  }

  shouldShowAuthorIcon(commentType: string) {
    return !(
      commentType === 'extension' ||
      commentType === 'status' ||
      commentType == 'assessment' ||
      commentType === 'scorm' ||
      commentType === 'scorm_extension'
    );
  }

  commentClasses(comment: TaskComment): object {
    return {
      [`${comment.commentType}-bubble`]: true,
      'first-in-series': comment.shouldShowTimestamp || comment.firstInSeries,
      'last-in-series': comment.shouldShowAvatar,
    };
  }
}
