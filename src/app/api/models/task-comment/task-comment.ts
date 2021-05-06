import { alertService, currentUser } from 'src/app/ajs-upgraded-providers';
import { AppInjector } from 'src/app/app-injector';
import { EmojiService } from 'src/app/common/services/emoji.service';
import { Entity } from '../entity';
import { TaskCommentService } from 'src/app/api/models/doubtfire-model';

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

  public updateFromJson(data: any): void {
    this.setFromJson(data, KEYS);

    const es: EmojiService = AppInjector.get(EmojiService);

    this.text = es.colonsToNative(data.comment);

    const names: string[] = data.author.name.split(' ');
    this.initials = `${names[0][0]}${names[1][0]}`.toUpperCase();

    this.author = data.author;
    this.recipient = data.recipient;
    this.timeOfMessage = data.created_at;
    this.recipientReadTime = data.recipient_read_time;
    this.commentType = data.type || 'text';
    this.replyToId = data.reply_to_id;
    this.isNew = data.is_new;
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  public get authorIsMe(): boolean {
    const cu: any = AppInjector.get(currentUser);
    return this.author.id === cu.profile.id;
  }

  public get recipientIsMe(): boolean {
    const cu: any = AppInjector.get(currentUser);
    return this.recipient.id === cu.profile.id;
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
    tcs.cacheSource = this.task.commentCache;
    tcs
      .delete({ projectId: this.project.project_id, taskDefinitionId: this.task.task_definition_id, id: this.id })
      .subscribe(
        (response: object) => {
          this.task.comments = this.task.comments.filter((e: TaskComment) => e.id !== this.id);
          this.task.refreshCommentData();
        },
        (error: any) => {
          AppInjector.get<any>(alertService).add('danger', error?.message || error || 'Unknown error', 2000);
        }
      );
  }
}
