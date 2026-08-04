import {Entity} from 'ngx-entity-service';
import {Unit} from './unit';

export class MoodleIntegration extends Entity {
  public id: number | null = null;
  public courseId: number | null = null;
  public assignmentId: number | null = null;
  public assignmentName: string | null = null;
  public fetchExtensions = false;
  public apiKeyConfigured = false;

  constructor(public unit: Unit) {
    super();
  }
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
}

export interface MoodleAssignment {
  id: number;
  name: string;
  duedate: number;
}

export interface MoodleConnectionResult {
  course: MoodleCourse | null;
  assignments: MoodleAssignment[];
  permissions: MoodlePermissionResult[];
}
