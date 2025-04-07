import { HttpClient } from '@angular/common/http';
import { Entity, EntityMapping } from 'ngx-entity-service';
import { Observable, tap } from 'rxjs';
import { AppInjector } from 'src/app/app-injector';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { Grade, GroupSet, TutorialStream, Unit } from './doubtfire-model';
import { TaskDefinitionService } from '../services/task-definition.service';

export type UploadRequirement = { key: string; name: string; type: string; tiiCheck?: boolean; tiiPct?: number };

export type SimilarityCheck = { key: string; type: string; pattern: string };

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
  uploadRequirements: UploadRequirement[] = [];
  tutorialStream: TutorialStream = null;
  plagiarismChecks: SimilarityCheck[] = [];
  plagiarismReportUrl: string;
  plagiarismWarnPct: number;
  restrictStatusUpdates: boolean;
  // groupSetId: number;
  groupSet: GroupSet = null;
  hasTaskSheet: boolean;
  hasTaskResources: boolean;
  scormEnabled: boolean;
  hasScormData: boolean;
  scormAllowReview: boolean;
  scormBypassTest: boolean;
  scormTimeDelayEnabled: boolean;
  scormAttemptLimit: number = 0;
  hasTaskAssessmentResources: boolean;
  isGraded: boolean;
  maxQualityPts: number;
  overseerImageId: number;
  assessmentEnabled: boolean;
  mossLanguage: string = 'moss c';

  readonly unit: Unit;

  constructor(unit: Unit) {
    super();
    this.unit = unit;
  }

  public toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      task_def: super.toJson(mappingData, ignoreKeys),
    };
  }

  /**
   * Save the task definition
   */
  public save(): Observable<TaskDefinition> {
    const svc = AppInjector.get(TaskDefinitionService);

    if (this.isNew) {
      // TODO: add progress modal
      return svc.create(
        {
          unitId: this.unit.id,
        },
        {
          entity: this,
          cache: this.unit.taskDefinitionCache,
          constructorParams: this.unit,
        }
      );
    } else {
      return svc.update(
        {
          unitId: this.unit.id,
          id: this.id,
        },
        { entity: this }
      );
    }
  }

  private originalSaveData: string;

  public get hasOriginalSaveData(): boolean {
    return this.originalSaveData !== undefined && this.originalSaveData !== null;
  }

  /**
   * To check if things have changed, we need to get the initial save data... as it
   * isn't empty by default. We can then use
   * this to check if there are changes.
   *
   * @param mapping the mapping to get changes
   */
  public setOriginalSaveData(mapping: EntityMapping<TaskDefinition>) {
    this.originalSaveData = JSON.stringify(this.toJson(mapping));
  }

  public hasChanges<T extends Entity>(mapping: EntityMapping<T>): boolean {
    if (!this.originalSaveData) {
      return false;
    }

    return this.originalSaveData != JSON.stringify(this.toJson(mapping));
  }

  public get isNew(): boolean {
    return !this.id;
  }

  public get unitId(): number {
    return this.unit.id;
  }

  public localDueDate(): Date {
    return this.targetDate;
  }

  public localDeadlineDate(): Date {
    return this.dueDate;
  }

  public matches(text: string): boolean {
    return this.abbreviation.toLowerCase().indexOf(text) !== -1 || this.name.toLowerCase().indexOf(text) !== -1;
  }

  /**
   * The final deadline for task submission.
   *
   * @returns the final due date
   */
  public finalDeadlineDate(): Date {
    return this.dueDate; // now in due date
  }

  public isGroupTask(): boolean {
    return this.groupSet !== null && this.groupSet !== undefined;
  }

  public getTaskPDFUrl(asAttachment: boolean = false): string {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/units/${this.unit.id}/task_definitions/${this.id}/task_pdf.json${
      asAttachment ? '?as_attachment=true' : ''
    }`;
  }

  public getTaskResourcesUrl(asAttachment: boolean = false) {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/units/${this.unit.id}/task_definitions/${this.id}/task_resources.json${
      asAttachment ? '?as_attachment=true' : ''
    }`;
  }

  public getScormDataUrl(asAttachment: boolean = false) {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/units/${this.unit.id}/task_definitions/${this.id}/scorm_data.json${
      asAttachment ? '?as_attachment=true' : ''
    }`;
  }

  /**
   * Open the SCORM test in a new tab - using preview mode.
   */
  public previewScormTest(): void {
    window.open(`#/task_def_id/${this.id}/preview-scorm`, '_blank');
  }

  public get targetGradeText(): string {
    return Grade.GRADES[this.targetGrade];
  }

  public hasPlagiarismCheck(): boolean {
    return this.plagiarismChecks?.length > 0;
  }

  public get needsMoss(): boolean {
    return this.uploadRequirements.some((upreq) => upreq.type === 'code' && upreq.tiiCheck);
  }

  public get taskSheetUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.id
    }/task_sheet`;
  }

  public get taskResourcesUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.id
    }/task_resources`;
  }

  public get scormDataUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.id
    }/scorm_data`;
  }

  public get taskAssessmentResourcesUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.id
    }/task_assessment_resources`;
  }

  public getTaskAssessmentResourcesUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.id
    }/task_assessment_resources.json`;
  }

  public deleteTaskSheet(): Observable<any> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.delete(this.taskSheetUploadUrl).pipe(tap(() => (this.hasTaskSheet = false)));
  }

  public deleteTaskResources(): Observable<any> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.delete(this.taskResourcesUploadUrl).pipe(tap(() => (this.hasTaskResources = false)));
  }

  public deleteScormData(): Observable<any> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.delete(this.scormDataUploadUrl).pipe(tap(() => (this.hasScormData = false)));
  }

  public deleteTaskAssessmentResources(): Observable<any> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient
      .delete(this.taskAssessmentResourcesUploadUrl)
      .pipe(tap(() => (this.hasTaskAssessmentResources = false)));
  }
}
