import {Entity} from 'ngx-entity-service';
import {Unit} from './unit';

export class LmsIntegration extends Entity {
  public id: number | null = null;
  public source = 'lti';
  public assignmentId: number | null = null;
  public assignmentName: string | null = null;
  public fetchExtensions = false;
  public autoSyncStudents = false;
  public withdrawMissingStudents = false;
  public autoSyncExtensions = false;
  public groupMappingEnabled = false;
  public skipUngraded = true;
  public sendGradeRationale = false;
  public validated = false;
  public validatedAt: string | null = null;
  public autoSyncFailingSince: string | null = null;
  public autoSyncLastError: string | null = null;
  public autoSyncTurnOffDate: string | null = null;
  public groupMappings: LmsGroupMapping[] = [];

  constructor(public unit: Unit) {
    super();
  }
}

export type LmsToggleSetting =
  | 'fetchExtensions'
  | 'autoSyncStudents'
  | 'withdrawMissingStudents'
  | 'autoSyncExtensions'
  | 'groupMappingEnabled'
  | 'skipUngraded'
  | 'sendGradeRationale';

export const LMS_TOGGLE_PARAMS: Record<LmsToggleSetting, string> = {
  fetchExtensions: 'fetch_extensions',
  autoSyncStudents: 'auto_sync_students',
  withdrawMissingStudents: 'withdraw_missing_students',
  autoSyncExtensions: 'auto_sync_extensions',
  groupMappingEnabled: 'group_mapping_enabled',
  skipUngraded: 'skip_ungraded',
  sendGradeRationale: 'send_grade_rationale',
};

export type LmsGroupTargetType = 'group' | 'campus' | 'tutorial' | 'ignore';

export interface LmsTutorialDraft {
  abbreviation: string;
  campusId: number | null;
  tutorialStreamId: number | null;
  meetingLocation: string;
  meetingDay: string;
  meetingTime: string;
  capacity: number | null;
  tutorId: number | null;
}

export interface LmsGroupSyncIssue {
  kind: 'added' | 'renamed' | 'deleted' | 'invalid';
  message: string;
  previousLmsGroupId?: number;
}

export class LmsGroupMapping extends Entity {
  public id: number | null = null;
  public lmsGroupId: number | null = null;
  public lmsGroupName = '';
  public targetType: LmsGroupTargetType | null = null;
  public groupSetId: number | null = null;
  public groupId: number | null = null;
  public campusId: number | null = null;
  public tutorialStreamId: number | null = null;
  public tutorialId: number | null = null;
  public createIfMissing = false;
  public createTutorialIfMissing = false;
  public tutorialDraft?: LmsTutorialDraft;
  public syncIssue?: LmsGroupSyncIssue;
  public duplicateNotice?: string;
}

/** The LMS course linked to a unit, as reported by the LTI service. */
export interface LmsLink {
  linked: boolean;
  contextId: string;
  contextLabel: string | null;
  contextTitle: string | null;
  courseUrl: string | null;
  platformName: string | null;
  platformUrl: string | null;
  namesAndRolesAvailable: boolean;
  courseDataAvailable: boolean;
  gradeLineItemLinked: boolean;
  capabilitiesCheckedAt: string | null;
  contextError: string | null;
}

export interface LmsOverview {
  link: LmsLink | null;
  linkError: string | null;
  integration: LmsIntegration;
}

export interface LmsGroupMappingPrefillResult {
  groupMappings: LmsGroupMapping[];
}

export interface LmsIntegrationValidationResult {
  valid: boolean;
  validated_at: string | null;
  groups: LmsGroup[];
  assignments: Array<{id: number; name: string; due_date: number}>;
  issues: Array<{
    type: string;
    lms_group_id?: number;
    lms_group_name?: string;
    message: string;
  }>;
  notices: Array<{
    type: string;
    lms_group_id?: number;
    lms_group_name?: string;
    message: string;
  }>;
}

export interface LmsCourse {
  contextId: string;
  label: string | null;
  title: string | null;
  startDate: number | null;
  endDate: number | null;
}

export interface LmsAssignment {
  id: number;
  name: string;
  dueDate: number;
}

export interface LmsGroup {
  id: number;
  name: string;
  idnumber?: string;
}

export interface LmsCourseData {
  course: LmsCourse;
  assignments: LmsAssignment[];
  groups: LmsGroup[];
}

export interface LmsGradeLineItemStatus {
  configured: boolean;
  visibility: 'unknown';
  reason?: 'service_not_enabled' | 'line_item_missing' | 'line_item_unavailable';
  message?: string;
  lineItem?: {
    id: string;
    label: string;
    scoreMaximum: number;
  };
}
