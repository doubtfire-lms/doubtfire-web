import { Entity } from 'ngx-entity-service';
import { TutorialStream, Unit, User } from './doubtfire-model';

export class TaskDefinition extends Entity {

  id: number;
  abbreviation: string;
  name: string;
  description: string;
  weighting: number;
  targetGrade: number;
  targetDate: Date;
  dueDate: Date;
  startDate: Date;
  uploadRequirements: {key: string, name: string, type: string}[];
  tutorialStream: TutorialStream;
  plagiarismChecks: {key: string, type: string, pattern: string}[];
  plagiarismReportUrl: string;
  plagiarismWarnPct: number;
  restrictStatusUpdates: boolean;
  groupSetId: number;
  hasTaskSheet: boolean;
  hasTaskResources: boolean;
  hasTaskAssessmentResources: boolean;
  isGraded: boolean;
  maxQualityPts: boolean;
  overseerImageId: number;
  assessmentEnabled: boolean;

  unit: Unit;

  constructor(unit: Unit) {
    super();
    this.unit = unit;
  }
}
