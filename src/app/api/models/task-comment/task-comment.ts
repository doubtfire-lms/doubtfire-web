import { alertService } from 'src/app/ajs-upgraded-providers';
import { AppInjector } from 'src/app/app-injector';
import { Entity } from 'ngx-entity-service';
import { Project, Task, TaskCommentService, User } from 'src/app/api/models/doubtfire-model';
import { UserService } from '../../services/user.service';
import API_URL from 'src/app/config/constants/apiURL';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

export class TaskComment extends Entity {
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
  timeOfMessage: string;
  recipientReadTime: string;
  commentType: string = "text";
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
    const userService: any = AppInjector.get(UserService);
    return this.author.id === userService.currentUser.id;
  }

  public get recipientIsMe(): boolean {
    const userService: any = AppInjector.get(UserService);
    return this.recipient.id === userService.currentUser.id;
  }

  public get isBubbleComment(): boolean {
    return ['text', 'discussion', 'audio', 'image', 'pdf'].includes(this.commentType);
  }

  public get project(): Project {
    return this.task.project;
  }

  public get currentUserCanEdit() {
    return this.authorIsMe || this.project?.unit.currentUserIsStaff;
  }

  public delete() {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    tcs
      .delete({ projectId: this.project.id, taskDefinitionId: this.task.definition.id, id: this.id }, { cache: this.task.commentCache })
      .subscribe({
        next: (response: object) => {
          // this.task.comments = this.task.comments.filter((e: TaskComment) => e.id !== this.id);
          this.task.refreshCommentData();
        },
        error: (error: any) => {
          AppInjector.get<any>(alertService).add('danger', error?.message || error || 'Unknown error', 2000);
        }
      }
      );
  }

  public get attachmentUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${this.project.id}/task_def_id/${this.task.definition.id}/comments/${this.id}?as_attachment=false`
  }
}
