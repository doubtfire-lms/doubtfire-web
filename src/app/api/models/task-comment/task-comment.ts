import {Entity} from 'ngx-entity-service';
import {Project, Task, TaskCommentService, User} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {UserService} from '../../services/user.service';

export class TaskComment extends Entity {
  private static readonly EDIT_WINDOW_MS = 10 * 60 * 1000;

  // Linked objects
  task: Task;
  originalComment: TaskComment = null;

  // Data returned from the comment service
  public id: number;
  text: string;
  abbreviation: string;
  author: User;
  recipient: User;
  createdAt: Date;
  recipientReadTime: string;
  commentType: string = 'text';
  isNew: boolean;
  replyToId: number;

  // Data calculated from the above
  initials: string;

  // Data used by the UI for rendering
  shouldShowTimestamp: boolean = false;
  shouldShowAvatar: boolean = false;
  firstInSeries: boolean = false;
  lastRead: boolean = false;

  /**
   * Create a new TaskComment
   *
   * @param initialData the Json data from the server
   * @param task        the Task that contains the comment
   */
  constructor(task: Task) {
    super(); // delay update from json
    this.task = task;
  }

  public get authorIsMe(): boolean {
    const userService: UserService = AppInjector.get(UserService);
    return this.author.id === userService.currentUser.id;
  }

  public get recipientIsMe(): boolean {
    const userService: UserService = AppInjector.get(UserService);
    return this.recipient.id === userService.currentUser.id;
  }

  public get isBubbleComment(): boolean {
    return ['text', 'discussion', 'audio', 'image', 'pdf'].includes(this.commentType);
  }

  public get isStaffAuthored(): boolean {
    return (
      this.task?.unit?.staff?.some((unitRole) => unitRole.user.id === this.author?.id) ?? false
    );
  }

  public get isAutomated(): boolean {
    if (!this.isBubbleComment) {
      return true;
    }

    return this.text?.trim().startsWith('**Automated Message:**') ?? false;
  }

  public get isManualFeedback(): boolean {
    return this.isStaffAuthored && !this.isAutomated;
  }

  public get project(): Project {
    return this.task.project;
  }

  public get currentUserCanEdit() {
    return (
      this.authorIsMe &&
      this.commentType === 'text' &&
      this.createdAt instanceof Date &&
      new Date().getTime() - this.createdAt.getTime() <= TaskComment.EDIT_WINDOW_MS
    );
  }

  public get currentUserCanDelete() {
    return this.authorIsMe || this.project?.unit.currentUserIsStaff;
  }

  public delete() {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    tcs
      .delete(
        {projectId: this.project.id, taskDefinitionId: this.task.definition.id, id: this.id},
        {cache: this.task.commentCache},
      )
      .subscribe({
        next: (_response: object) => {
          // this.task.comments = this.task.comments.filter((e: TaskComment) => e.id !== this.id);
          this.task.refreshCommentData();
        },
        error: (error: Error) => {
          const message = error.message || 'Unknown error';
          AppInjector.get(AlertService).error(message, 2000);
        },
      });
  }

  public get attachmentUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${this.project.id}/task_def_id/${this.task.definition.id}/comments/${this.id}?as_attachment=false`;
  }
}
