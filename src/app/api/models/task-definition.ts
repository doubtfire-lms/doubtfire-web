import {Entity, EntityCache, EntityMapping} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {TaskDefinitionService} from '../services/task-definition.service';
import {DiscussionPrompt} from './discussion-prompt';
import {GroupSet, LearningOutcome, Project, TutorialStream, Unit} from './doubtfire-model';
import {Task} from './doubtfire-model';
import {OverseerStep} from './overseer/overseer-step';
import {TaskPrerequisite} from './task-prerequisite';

export interface UploadRequirement {
  key: string;
  name: string;
  type: string;
  tiiCheck?: boolean;
  tiiPct?: number;
  submissionHistory?: boolean;
}

export interface SimilarityCheck {
  key: string;
  type: string;
  pattern: string;
}

export interface TaskDefinitionGradeDueDate {
  targetGrade: number;
  targetDueDate?: Date;
  startDate?: Date;
}

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
  hasTaskAssessmentScript: boolean;
  isGraded: boolean;
  maxQualityPts: number;
  overseerImageId: number;
  assessmentEnabled: boolean;
  similarityLanguage: string = 'c';
  hasJplagReport: boolean;
  assessInPortfolioOnly: boolean;
  requiresDiscussion: boolean;
  useResourcesForJplagBaseCode: boolean;
  lockAssessmentsToTutorialStream: boolean;
  discussionPromptsCount: number;
  overseerResourceFiles: string[] = [];

  gradeDueDates: TaskDefinitionGradeDueDate[] = [];

  public readonly taskPrerequisitesCache: EntityCache<TaskPrerequisite> =
    new EntityCache<TaskPrerequisite>();

  public readonly discussionPromptsCache: EntityCache<DiscussionPrompt> =
    new EntityCache<DiscussionPrompt>();

  public readonly learningOutcomesCache: EntityCache<LearningOutcome> =
    new EntityCache<LearningOutcome>();

  public readonly overseerStepsCache: EntityCache<OverseerStep> = new EntityCache<OverseerStep>();

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
        },
      );
    } else {
      return svc.update(
        {
          unitId: this.unit.id,
          id: this.id,
        },
        {entity: this},
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

  public refresh(): void {
    const alerts = AppInjector.get(AlertService);
    AppInjector.get(TaskDefinitionService)
      .fetch({
        unitId: this.unit.id,
        id: this.id,
      })
      .subscribe({
        next: (taskDefinition) => {
          console.log(taskDefinition.name);
        },
        error: (message) => alerts.error(message, 6000),
      });
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

  public gradeTargetDate(targetGrade: number): Date | null {
    return this.gradeDueDates.find((date) => date.targetGrade === targetGrade)?.targetDueDate;
  }

  public gradeStartDate(targetGrade: number): Date | null {
    return this.gradeDueDates.find((date) => date.targetGrade === targetGrade)?.startDate;
  }

  public setGradeTargetDate(targetGrade: number, value: Date | null): void {
    if (targetGrade === 0) {
      this.targetDate = value;
      return;
    }

    this.gradeDueDateFor(targetGrade).targetDueDate = value;
  }

  public setGradeStartDate(targetGrade: number, value: Date | null): void {
    if (targetGrade === 0) {
      this.startDate = value;
      return;
    }

    this.gradeDueDateFor(targetGrade).startDate = value;
  }

  private gradeDueDateFor(targetGrade: number): TaskDefinitionGradeDueDate {
    let gradeDueDate = this.gradeDueDates.find((date) => date.targetGrade === targetGrade);

    if (!gradeDueDate) {
      gradeDueDate = {targetGrade};
      this.gradeDueDates.push(gradeDueDate);
    }

    return gradeDueDate;
  }

  public localDeadlineDate(): Date {
    return this.dueDate;
  }

  public get dueWeek(): number {
    const startDate = this.unit.startDate;
    const dueDate = this.localDueDate() || this.unit.endDate;

    const diffInMs = dueDate.getTime() - startDate.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7)); // Convert ms to weeks
  }

  public matches(text: string): boolean {
    return (
      this.abbreviation.toLowerCase().indexOf(text) !== -1 ||
      this.name.toLowerCase().indexOf(text) !== -1
    );
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

  public getOutcomeBatchUploadUrl(): string {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/task_definitions/${this.id}/outcomes/csv`;
  }

  public getFeedbackTemplateBatchUploadUrl(): string {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/task_definitions/${this.id}/feedback_chips/csv`;
  }

  /**
   * Open the SCORM test in a new tab - using preview mode.
   */
  public previewScormTest(): void {
    window.open(`/task_def_id/${this.id}/preview-scorm`, '_blank');
  }

  public get targetGradeText(): string {
    return this.unit.gradeLabel(this.targetGrade);
  }

  public hasPlagiarismCheck(): boolean {
    return this.plagiarismChecks?.length > 0;
  }

  public get needsJplag(): boolean {
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

  public get taskPrerequisiteUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.id
    }/prerequisites`;
  }

  public get taskOverseerResourcesUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.id
    }/task_assessment_resources`;
  }

  public getOverseerResourcesUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.id
    }/task_assessment_resources.json`;
  }

  public get taskOverseerExecutionScriptUrl() {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${this.id}/overseer_script`;
  }

  public getJplagReportUrl() {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${this.id}/jplag_report`;
  }

  public deleteTaskSheet(): Observable<void> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient
      .delete<void>(this.taskSheetUploadUrl)
      .pipe(tap(() => (this.hasTaskSheet = false)));
  }

  public deleteTaskResources(): Observable<void> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient
      .delete<void>(this.taskResourcesUploadUrl)
      .pipe(tap(() => (this.hasTaskResources = false)));
  }

  public deleteScormData(): Observable<void> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient
      .delete<void>(this.scormDataUploadUrl)
      .pipe(tap(() => (this.hasScormData = false)));
  }

  public deleteOverseerResources(): Observable<void> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient
      .delete<void>(this.taskOverseerResourcesUploadUrl)
      .pipe(tap(() => (this.hasTaskAssessmentResources = false)));
  }

  public projectTask(project?: Project): Task | undefined {
    return project?.tasks?.find((p) => p.definition.id === this.id);
  }
}
