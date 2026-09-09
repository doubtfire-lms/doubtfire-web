import {Entity, EntityCache} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Project, User, UserService} from './doubtfire-model';

export class Engagement extends Entity {
  private static readonly DELETE_WINDOW_MS = 60 * 60 * 1000;
  private static readonly CONVENOR_DELETE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

  id: number;
  project: Project;
  user: User;
  students: User[] = [];
  engagementType: string;
  note: string;
  occurredAt: Date;
  evidenceUrl?: string;
  contentType?: 'image' | 'pdf';
  hasAttachment: boolean;
  attachmentFileName?: string;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;

  readonly commentCache: EntityCache<EngagementComment> = new EntityCache<EngagementComment>();

  constructor(project?: Project) {
    super();
    this.project = project;
  }

  get comments(): readonly EngagementComment[] {
    return this.commentCache.currentValues;
  }

  get attachmentUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${this.project.id}/engagements/${this.id}/attachment`;
  }

  get authorIsMe(): boolean {
    return this.user?.id === AppInjector.get(UserService).currentUser.id;
  }

  /**
   * Engagements can only be deleted for a limited period after they are created.
   */
  private withinDeleteWindow(windowMs: number): boolean {
    return this.createdAt instanceof Date && Date.now() - this.createdAt.getTime() <= windowMs;
  }

  /**
   * Tutors can delete their own engagements within an hour of creating them,
   * convenors can delete any engagement in their unit for up to a week.
   */
  get currentUserCanDelete(): boolean {
    if (this.project?.unit?.myRole === 'Convenor') {
      return this.withinDeleteWindow(Engagement.CONVENOR_DELETE_WINDOW_MS);
    }

    return this.authorIsMe && this.withinDeleteWindow(Engagement.DELETE_WINDOW_MS);
  }
}

export class EngagementComment extends Entity {
  private static readonly EDIT_WINDOW_MS = 10 * 60 * 1000;

  id: number;
  engagement: Engagement;
  user: User;
  comment: string;
  replyToId?: number;
  replyTo?: EngagementComment;
  createdAt: Date;
  updatedAt: Date;

  constructor(engagement?: Engagement) {
    super();
    this.engagement = engagement;
  }

  get authorIsMe(): boolean {
    return this.user.id === AppInjector.get(UserService).currentUser.id;
  }

  get currentUserCanEdit(): boolean {
    return (
      this.authorIsMe &&
      this.createdAt instanceof Date &&
      Date.now() - this.createdAt.getTime() <= EngagementComment.EDIT_WINDOW_MS
    );
  }

  get currentUserCanDelete(): boolean {
    return this.authorIsMe || this.engagement.project.unit.myRole === 'Convenor';
  }
}
