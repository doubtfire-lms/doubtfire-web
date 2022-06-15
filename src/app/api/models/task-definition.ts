import { Entity } from 'ngx-entity-service';
import { AppInjector } from 'src/app/app-injector';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { GroupSet, TutorialStream, Unit, User } from './doubtfire-model';

export class TaskDefinition extends Entity {

  id: number;
  seq: number;
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
  // groupSetId: number;
  groupSet: GroupSet = null;
  hasTaskSheet: boolean;
  hasTaskResources: boolean;
  hasTaskAssessmentResources: boolean;
  isGraded: boolean;
  maxQualityPts: number;
  overseerImageId: number;
  assessmentEnabled: boolean;

  readonly unit: Unit;

  constructor(unit: Unit) {
    super();
    this.unit = unit;
  }

  public localDueDate(): Date {
    return this.dueDate;
  }

  public localDeadlineDate(): Date {
    return this.dueDate;
  }

  public isGroupTask(): boolean {
    return this.groupSet !== null;
  }

  public getTaskPDFUrl(asAttachment: boolean = false): string {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/units/${this.unit.id}/task_definitions/${this.id}/task_pdf.json${ asAttachment ? "?as_attachment=true" : ""}`;
  }

  public getTaskResourcesUrl(asAttachment: boolean = false) {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/units/${this.unit.id}/task_definitions/${this.id}/task_resources.json${ asAttachment ? "?as_attachment=true" : ""}`;
  }

}
