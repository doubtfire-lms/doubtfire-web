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
  public groupMappings: MoodleGroupMapping[] = [];
  public apiKeyConfigured = false;

  constructor(public unit: Unit) {
    super();
  }
}

export type MoodleGroupTargetType = 'group' | 'campus' | 'tutorial';

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
