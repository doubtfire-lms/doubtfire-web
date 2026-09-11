import type {TaskStatusEnum} from './task-status';

export type NotificationKind =
  | 'new_task_comment'
  | 'task_status_changed'
  | 'feedback_warning'
  | 'weekly_summary'
  | 'overseer_failed'
  | 'pdf_generation_failed'
  | 'discuss_warning'
  | 'discuss_expired'
  | 'moderation_note_added'
  | 'moderation_note_reply'
  | 'moderation_note_from_mentee'
  | 'portfolio_ready'
  | 'portfolio_failed'
  | 'communication_email';

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

export interface NotificationDestination {
  type: 'unit_inbox';
  unitId: number;
}

export interface WeeklySummaryTask {
  abbreviation: string;
  name: string;
  reason: string;
  reasonLabel: string;
  status?: TaskStatusEnum;
}

export interface WeeklySummaryTutor {
  tutorName: string;
  students: number;
  totalAssessments: number;
  weeklyAssessments: number;
  totalComments: number;
  weeklyComments: number;
  awaitingFeedback: number;
  oldestTaskDays: number;
  totalDiscussions: number;
  weeklyDiscussions: number;
}

export interface WeeklySummaryTutorialStream {
  name: string;
  unallocatedStudents: number;
  tutors: WeeklySummaryTutor[];
}

export interface WeeklySummary {
  audience: 'student' | 'staff';
  weekStart: string;
  weekEnd: string;
  unitComments: number;
  unitTaskActivity: number;
  sentComments: number;
  receivedComments: number;
  taskActivity?: number;
  studentTaskActivity: number;
  tutorAllocated?: boolean;
  didRevertToPass?: boolean;
  portfolioExists?: boolean;
  topTasks: WeeklySummaryTask[];
  hasStudents?: boolean;
  isConvenor?: boolean;
  assessedTasks?: number;
  discussedTasks?: number;
  awaitingFeedback?: number;
  oldestTaskDays?: number;
  revertedStudents: string[];
  revertedStudentCount?: number;
  tutorialStreams: WeeklySummaryTutorialStream[];
}

export interface NotificationGroup {
  key: string;
  notificationIds: number[];
  tutorNoteNotificationIds: number[];
  unit: NotificationUnit;
  projectId?: number;
  task?: NotificationTask;
  destination?: NotificationDestination;
  counts: Partial<Record<NotificationKind, number>>;
  eventCount: number;
  latestStatus?: TaskStatusEnum;
  severity: NotificationSeverity;
  read: boolean;
  readAt?: Date;
  latestAt: Date;
  tutorNoteIds: number[];
  tutorNoteUnitRoleId?: number;
  tutorNoteOnTaskTutor: boolean;
  /** The newest failed overseer run in the group, so its report can be opened. */
  overseerAssessmentId?: number;
  /** Rendered content of an email sent by the communications system. */
  messageSubject?: string;
  messageBody?: string;
  /** Statistics captured when a weekly summary notification was created. */
  weeklySummary?: WeeklySummary;
  /** What happened, without the task it happened to. */
  detail: string;
  summary: string;
}

export interface NotificationPage {
  groups: NotificationGroup[];
  page: number;
  perPage: number;
  total: number;
  unreadCount: number;
  unreadCountsByUnit: Record<number, number>;
}

export interface NotificationQuery {
  state?: NotificationState;
  unitId?: number;
  kinds?: NotificationKind[];
  query?: string;
  page?: number;
  perPage?: number;
}
