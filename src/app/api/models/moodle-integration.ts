import {Entity} from 'ngx-entity-service';
import {Unit} from './unit';

export class MoodleIntegration extends Entity {
  public id: number | null = null;
  public courseId: number | null = null;
  public assignmentId: number | null = null;
  public assignmentName: string | null = null;
  public fetchExtensions = false;
  public autoSyncStudents = false;
  public autoSyncExtensions = false;
  public groupMappingEnabled = false;
  public validated = false;
  public validatedAt: string | null = null;
  public groupMappings: MoodleGroupMapping[] = [];
  public apiKeyConfigured = false;

  constructor(public unit: Unit) {
    super();
  }
}

export type MoodleGroupTargetType = 'group' | 'campus' | 'tutorial' | 'ignore';

export interface MoodleTutorialDraft {
  abbreviation: string;
  campusId: number | null;
  tutorialStreamId: number | null;
  meetingLocation: string;
  meetingDay: string;
  meetingTime: string;
  capacity: number | null;
  tutorId: number | null;
}

export interface MoodleGroupSyncIssue {
  kind: 'added' | 'renamed' | 'deleted' | 'invalid';
  message: string;
  previousMoodleGroupId?: number;
}

export class MoodleGroupMapping extends Entity {
  public id: number | null = null;
  public moodleGroupId: number | null = null;
  public moodleGroupName = '';
  public targetType: MoodleGroupTargetType | null = null;
  public groupSetId: number | null = null;
  public groupId: number | null = null;
  public campusId: number | null = null;
  public tutorialStreamId: number | null = null;
  public tutorialId: number | null = null;
  public createIfMissing = false;
  public createTutorialIfMissing = false;
  public tutorialDraft?: MoodleTutorialDraft;
  public syncIssue?: MoodleGroupSyncIssue;
  public duplicateNotice?: string;
}

export interface MoodleGroupMappingPrefillResult {
  groupMappings: MoodleGroupMapping[];
}

export interface MoodleIntegrationValidationResult {
  valid: boolean;
  validated_at: string | null;
  groups: MoodleGroup[];
  assignments: MoodleAssignment[];
  issues: Array<{
    type: string;
    moodle_group_id?: number;
    moodle_group_name?: string;
    message: string;
  }>;
  notices: Array<{
    type: string;
    moodle_group_id?: number;
    moodle_group_name?: string;
    message: string;
  }>;
}

export interface MoodlePermissionResult {
  function: string;
  success: boolean;
  message?: string;
  error?: string;
}

export interface MoodleCourse {
  id: number;
  fullname: string;
  shortname: string;
  startdate: number | null;
  enddate: number | null;
}

export interface MoodleAssignment {
  id: number;
  name: string;
  duedate: number;
}

export interface MoodleGroup {
  id: number;
  name: string;
  idnumber?: string;
}

export interface MoodleConnectionResult {
  course: MoodleCourse | null;
  assignments: MoodleAssignment[];
  groups: MoodleGroup[];
  permissions: MoodlePermissionResult[];
}
