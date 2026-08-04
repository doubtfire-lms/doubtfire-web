import {Entity} from 'ngx-entity-service';
import {Unit} from './unit';

export class MoodleIntegration extends Entity {
  public id: number | null = null;
  public courseId: number | null = null;
  public assignmentId: number | null = null;
  public assignmentName: string | null = null;
  public fetchExtensions = false;
  public groupMappingEnabled = false;
  public groupMappings: MoodleGroupMapping[] = [];
  public apiKeyConfigured = false;

  constructor(public unit: Unit) {
    super();
  }
}

export type MoodleGroupTargetType = 'group' | 'campus' | 'tutorial';

export interface MoodleGroupMapping {
  id?: number;
  moodleGroupId: number | null;
  moodleGroupName: string;
  targetType: MoodleGroupTargetType | null;
  groupSetId: number | null;
  groupId: number | null;
  campusId: number | null;
  tutorialStreamId: number | null;
  tutorialId: number | null;
  createIfMissing: boolean;
  createTutorialIfMissing: boolean;
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
