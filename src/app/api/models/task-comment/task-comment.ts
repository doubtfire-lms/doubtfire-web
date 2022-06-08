import { alertService } from 'src/app/ajs-upgraded-providers';
import { AppInjector } from 'src/app/app-injector';
import { Entity } from 'ngx-entity-service';
import { TaskCommentService } from 'src/app/api/models/doubtfire-model';
import { UserService } from '../../services/user.service';

const KEYS = ['id'];

export interface CommentAuthor {
  id: number;
  name: string;
  email: string;
}

export class TaskComment extends Entity {
  // Linked objects
  task: any;
  originalComment: TaskComment = null;

  // Data returned from the comment service
  id: number;
  text: string;
  abbreviation: string;
  author: CommentAuthor;
  recipient: CommentAuthor;
  createdAt: string;
  timeOfMessage: string;
  recipientReadTime: string;
  commentType: string;
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
  constructor(initialData: object, task: any) {
    super(); // delay update from json
    this.task = task;
    if (initialData) {
      this.updateFromJson(initialData);
    }
  }

  /**
   * Not used for TaskComments as they are not updated.
   */
  toJson(): any {
    return undefined;
  }

  public get key(): string {
    return this.id.toString();
  }

  public override updateFromJson(data: any, params?: any): void  {


    const names: string[] = data.author.name.split(' ');
    this.initials = `${names[0][0]}${names[1][0]}`.toUpperCase();

    this.timeOfMessage = data.created_at;
    this.commentType = data.type || 'text';

  }

  public keyForJson(json: any): string {
    return json.id;
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

  public get project(): any {
    return this.task.project();
  }

  public get currentUserCanEdit() {
    return this.authorIsMe || this.project?.currentUserIsStaff();
  }

  public delete() {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    tcs
      .delete({ projectId: this.project.project_id, taskDefinitionId: this.task.task_definition_id, id: this.id }, { cache: this.task.commentCache })
      .subscribe({
        next: (response: object) => {
          this.task.comments = this.task.comments.filter((e: TaskComment) => e.id !== this.id);
          this.task.refreshCommentData();
        },
        error: (error: any) => {
          AppInjector.get<any>(alertService).add('danger', error?.message || error || 'Unknown error', 2000);
        }
      }
      );
  }
}
