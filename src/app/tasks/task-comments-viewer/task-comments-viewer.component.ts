import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  DiscussionComment,
  Project,
  ScormComment,
  ScormExtensionComment,
  Task,
  TaskComment,
  TaskCommentService,
  TaskService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {ExtensionComment} from 'src/app/api/models/task-comment/extension-comment';
import {FeedbackTemplateService} from 'src/app/api/services/feedback-template.service';
import {CommentsModalService} from 'src/app/common/modals/comments-modal/comments-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {TaskCommentComposerData} from '../task-comment-composer/task-comment-composer.component';
import {TaskAssessmentComment} from './task-assessment-comment/task-assessment-comment.component';

@Component({
  selector: 'task-comments-viewer',
  templateUrl: './task-comments-viewer.component.html',
  styleUrls: ['./task-comments-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskCommentsViewerComponent implements OnChanges, OnDestroy {
  // Get the comments body from the HTML template
  @ViewChild('commentsBody') commentsBody: ElementRef;

  lastComment: TaskComment;
  @Input() project: Project;
  loading: boolean = true;

  sharedCommentComposerData: TaskCommentComposerData = {
    originalComment: null,
    editingComment: null,
  };

  @Input() comment?: TaskComment;
  @Input() task: Task;
  @Input() refocusOnTaskChange: boolean;

  private taskStatusSub: Subscription;
  private commentAddedSub: Subscription;

  constructor(
    private taskCommentService: TaskCommentService,
    private feedbackTemplateService: FeedbackTemplateService,
    private userService: UserService,
    private taskService: TaskService,
    private constants: DoubtfireConstants,
    private commentsModalRef: CommentsModalService,
    private alerts: AlertService,
  ) {
    this.commentAddedSub = this.taskCommentService.commentAdded$.subscribe((_tc: TaskComment) => {
      this.scrollDown();
    });

    this.taskStatusSub = this.taskService.taskStatusUpdated$.subscribe((task) => {
      if (task && task.project && this.project && task.project.id === this.project.id) {
        this.fetchComments(task, false);
      }
    });
  }

  ngOnDestroy(): void {
    this.taskStatusSub?.unsubscribe();
    this.commentAddedSub?.unsubscribe();
  }

  public asAssessmentComment(comment: TaskComment): TaskAssessmentComment | null {
    return comment.commentType === 'assessment'
      ? (comment as unknown as TaskAssessmentComment)
      : null;
  }

  public asScormComment(comment: TaskComment): ScormComment | null {
    return comment.commentType === 'scorm' ? (comment as ScormComment) : null;
  }

  public asExtensionComment(comment: TaskComment): ExtensionComment | null {
    return comment.commentType === 'extension' ? (comment as ExtensionComment) : null;
  }

  public asScormExtensionComment(comment: TaskComment): ScormExtensionComment | null {
    return comment.commentType === 'scorm_extension' ? (comment as ScormExtensionComment) : null;
  }

  public asDiscussionComment(comment: TaskComment): DiscussionComment | null {
    return comment.commentType === 'discussion' ? (comment as DiscussionComment) : null;
  }

  ngOnChanges(changes: SimpleChanges) {
    // Must have project for task to be mapped
    if (changes.task?.currentValue?.project != null) {
      this.project = changes.task.currentValue.project;
      this.fetchComments(this.task, true, true);
    } else {
      this.loading = false;
    }
  }

  fetchComments(task: Task, useCache: boolean = true, fetchAfterCache: boolean = false) {
    if (!task.comments.length) {
      // If the cache is empty we know the query will attempt to fetch, so we can avoid fetching a second time
      useCache = false;
      fetchAfterCache = false;
    }

    const request$ = !useCache
      ? this.taskCommentService.fetchAll({
          projectId: this.project.id,
          taskDefinitionId: task.definition.id,
        })
      : this.taskCommentService.query(
          {
            projectId: this.project.id,
            taskDefinitionId: task.definition.id,
          },
          task,
          {
            cache: task.commentCache,
            constructorParams: task,
          },
        );

    request$.subscribe((comments) => {
      // Remove task notification
      task.numNewComments = 0;

      for (const comment of comments) {
        const existingComment = task.commentCache.get(comment.id);
        comment.task = task;
        if (!existingComment) {
          // Update the cache with any new comments
          task.commentCache.add(comment);
        } else if (
          existingComment.recipientReadTime !== comment.recipientReadTime ||
          existingComment.text !== comment.text
        ) {
          // Update cached read receipts or edited messages
          task.commentCache.set(comment.id, comment);
        }
      }

      for (const cachedComment of task.comments) {
        if (!comments.find((c) => c.id === cachedComment.id)) {
          // This comment is in cache but not in the latest comments list
          task.commentCache.delete(cachedComment.id);
        }
      }

      task.refreshCommentData();

      const lastReadComment: TaskComment = task.comments
        .slice()
        .reverse()
        .find(
          (comment: TaskComment) => comment.recipientReadTime != null && !comment.recipientIsMe,
        );

      setTimeout(() => {
        this.loading = false;
        this.scrollDown();
        if (useCache && fetchAfterCache) {
          this.fetchComments(task, false, false);
        }
      }, 100);

      if (lastReadComment) {
        for (const comment of task.comments) {
          comment.lastRead = false;
        }
        lastReadComment.lastRead = true;
      }
    });

    if (this.project.unit.currentUserIsStaff) {
      this.feedbackTemplateService
        .query({contextType: 'task_definitions', contextId: task.definition.id}, {})
        .subscribe({
          error: () => this.alerts.error('Error loading task feedback templates.'),
        });
    }
  }

  scrollDown() {
    setTimeout(() => {
      const element = this.commentsBody.nativeElement;
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
    this.taskCommentService.addComment(this.task, file, 'file', null).subscribe({
      error: (error) => {
        this.alerts.error(error || error?.message, 2000);
      },
    });
  }

  scrollToComment(commentID) {
    document.querySelector(`#comment-${commentID}`).scrollIntoView();
  }

  openCommentsModal(comment: TaskComment) {
    const resourceUrl = comment.attachmentUrl;
    this.commentsModalRef.show(resourceUrl, comment);
  }

  shouldShowAuthorIcon(commentType: string) {
    return !(
      commentType === 'extension' ||
      commentType === 'status' ||
      commentType == 'assessment' ||
      commentType === 'scorm' ||
      commentType === 'scorm_extension' ||
      commentType === 'discussed_in_class' ||
      commentType === 'checked_in'
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
