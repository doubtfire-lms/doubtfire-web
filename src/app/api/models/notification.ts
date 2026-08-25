import type {TaskStatusEnum} from './task-status';

export type NotificationKind =
  | 'feedback_left'
  | 'task_status_changed'
  | 'overseer_failed'
  | 'pdf_generation_failed'
  | 'discuss_warning'
  | 'discuss_expired'
  | 'tutor_note';

export type NotificationSeverity = 'critical' | 'warning' | 'normal';
export type NotificationState = 'all' | 'unread' | 'read';
export type NotificationFrequency = 'off' | 'hourly' | 'daily' | 'weekly';

export interface NotificationUnit {
  id: number;
  code: string;
  name: string;
}

export interface NotificationTask {
  id: number;
  projectId: number;
  taskDefinitionId: number;
  abbreviation: string;
  name: string;
  staffView: boolean;
  studentName?: string;
}

export interface NotificationGroup {
  key: string;
  notificationIds: number[];
  tutorNoteNotificationIds: number[];
  unit: NotificationUnit;
  task?: NotificationTask;
  counts: Partial<Record<NotificationKind, number>>;
  eventCount: number;
  latestStatus?: TaskStatusEnum;
  severity: NotificationSeverity;
  read: boolean;
  readAt?: Date;
  latestAt: Date;
  tutorNoteIds: number[];
  tutorNoteUnitRoleId?: number;
  summary: string;
}

export interface NotificationPage {
  groups: NotificationGroup[];
  page: number;
  perPage: number;
  total: number;
  unreadCount: number;
}

export interface NotificationQuery {
  state?: NotificationState;
  unitId?: number;
  kinds?: NotificationKind[];
  query?: string;
  page?: number;
  perPage?: number;
}
