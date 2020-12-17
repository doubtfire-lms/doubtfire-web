import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { TaskCommentViewService } from 'src/app/common/services/task-comment.service';
import { taskService, alertService, taskComment, Task, commentsModal } from 'src/app/ajs-upgraded-providers';
import { TaskComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';
import { TaskCommentComposerData } from '../task-comment-composer/task-comment-composer.component';

@Component({
  selector: 'task-comments-viewer',
  templateUrl: './task-comments-viewer.component.html',
  styleUrls: ['./task-comments-viewer.component.scss'],
})
export class TaskCommentsViewerComponent implements OnChanges, OnInit {
  // Get the comments body from the HTML template
  @ViewChild('commentsBody') commentsBody: ElementRef;

  lastComment: TaskComment;
  project: any = {};
  loading: boolean = true;

  sharedComposerData: TaskCommentComposerData = {
    originalComment: null,
  };

  @Input() comment?: TaskComment;
  @Input() task: {
    task_definition_id: number;
    comments: TaskComment[];
    refreshCommentData: any;
    commentCache: Map<string, TaskComment>;
  } = {
    task_definition_id: null,
    comments: [],
    refreshCommentData: null,
    commentCache: new Map<string, TaskComment>(),
  }; // TODO: Update to task when migrated
  @Input() refocusOnTaskChange: boolean;

  constructor(
    private taskCommentViewService: TaskCommentViewService,
    private taskCommentService: TaskCommentService,
    @Inject(taskService) private ts: any,
    @Inject(commentsModal) private commentsModalRef: any,
    @Inject(Task) private TaskModel: any,
    @Inject(alertService) private alerts: any
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    this.loading = true;

    // Must have project for task to be mapped
    if (changes.task?.currentValue?.project != null) {
      this.project = changes.task.currentValue.project();
      this.taskCommentService.cacheSource = this.task.commentCache;
      this.taskCommentService
        .query(
          {
            projectId: this.project.project_id,
            taskDefinitionId: this.task.task_definition_id,
          },
          this.task
        )
        .subscribe((comments) => {
          this.task.comments = comments;

          this.task.refreshCommentData();

          const lastReadComment: TaskComment = this.task.comments
            .slice()
            .reverse()
            .find((comment: TaskComment) => comment.recipientReadTime != null && !comment.recipientIsMe);

          this.loading = false;

          if (lastReadComment) {
            lastReadComment.lastRead = true;
          }

          this.scrollDown();
        });

      // );
      // this.taskCommentService.cacheSource = this.task.commentCache;
      // this.taskCommentService.query(
      //   {
      //     project_id: this.project.project_id,
      //     task_definition_id: this.task.task_definition_id,
      //   },
      //   (response: any) => {
      //     this.task.comments = this.ts.mapComments(response);
      //     const lastReadComment = this.task.comments
      //       .slice()
      //       .reverse()
      //       .find((comment) => comment.recipientReadTime != null && !comment.recipient_is_me);
      //     if (lastReadComment) {
      //       lastReadComment.last_read = true;
      //     }
      //     this.task.num_new_comments = 0;
      //     this.ts.scrollDown();
      //     this.loading = false;
      //   }
      // );

      // this.taskCommentViewService.setTask(this.task);
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

  uploadFiles(event) {
    [...event].forEach((file) => {
      if (
        [
          'audio/mpeg',
          'audio/vorbis',
          'audio/mp4',
          'audio/ogg',
          'audio/wav',
          'audio/webm',
          'image/png',
          'image/pdf',
          'application/pdf',
          'image/gif',
          'image/jpg',
          'image/jpeg',
        ].includes(file.type)
      ) {
        this.postAttachmentComment(file);
      } else {
        this.alerts.add('danger', 'I cannot upload that file - only images, audio, and PDFs.', 4000);
      }
    });
    // this.task.comments = this.ts.mapComments(this.task.comments);
  }

  // # Upload image files as comments to a given task
  postAttachmentComment(file) {
    const self: TaskCommentsViewerComponent = this;

    this.taskCommentService.addComment(this.task, file, 'file', null).subscribe(
      (tc: TaskComment) => {
        self.scrollDown();
      },
      (error: any) => {
        this.alerts.add('danger', error || error?.message, 2000);
      }
    );
  }

  scrollToComment(commentID) {
    document.querySelector(`#comment-${commentID}`).scrollIntoView();
  }

  openCommentsModal(comment: TaskComment) {
    const resourceUrl = this.TaskModel.generateCommentsAttachmentUrl(this.project, this.task, comment);
    this.commentsModalRef.show(resourceUrl, comment.commentType);
  }

  shouldShowAuthorIcon(commentType: string) {
    return !(commentType === 'extension' || commentType === 'status');
  }

  getCommentAttachment(comment: TaskComment) {
    return this.TaskModel.generateCommentsAttachmentUrl(this.project, this.task, comment);
  }

  commentClasses(comment: TaskComment): object {
    return {
      [`${comment.commentType}-bubble`]: true,
      'first-in-series': comment.shouldShowTimestamp || comment.firstInSeries,
      'last-in-series': comment.shouldShowAvatar,
    };
  }
}
