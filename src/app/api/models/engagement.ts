import {Entity, EntityCache} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Project, User, UserService} from './doubtfire-model';

export class Engagement extends Entity {
  id: number;
  project: Project;
  user: User;
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
