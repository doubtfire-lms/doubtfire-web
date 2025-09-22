import {Entity, EntityCache, RequestOptions} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {formatDate} from '@angular/common';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {
  TaskDefinition,
  Project,
  Unit,
  TaskComment,
  TaskStatusEnum,
  TaskStatus,
  TaskStatusUiData,
  TaskService,
  Group,
  TaskCommentService,
  TaskSimilarity,
  TaskSimilarityService,
  TestAttempt,
  TestAttemptService,
  ScormComment,
} from './doubtfire-model';
import {Grade} from './grade';
import {LOCALE_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {uploadSubmissionModal} from 'src/app/ajs-upgraded-providers';
import {AlertService} from 'src/app/common/services/alert.service';
import {MappingFunctions} from '../services/mapping-fn';
import { GradeTaskModalService } from 'src/app/tasks/modals/grade-task-modal/grade-task-modal.service';

export class Task extends Entity {
  id: number;

  status: TaskStatusEnum = 'not_started';
  dueDate: Date;
  extensions: number;
  scormExtensions: number;
  submissionDate: Date;
  completionDate: Date;
  timesAssessed: number;
  grade?: number;
  qualityPts: number;
  includeInPortfolio: boolean = true;
  similarityFlag: boolean = false;
  numNewComments: number = 0;
  hasExtensions: boolean;

  project: Project;
  definition: TaskDefinition;

  //TODO: map task submission details
  hasPdf: boolean = false;
  processingPdf: boolean = false;

  pinned: boolean = false;

  public topWeight: number = 0;
  public readonly commentCache: EntityCache<TaskComment> = new EntityCache<TaskComment>();

  public readonly similarityCache: EntityCache<TaskSimilarity> = new EntityCache<TaskSimilarity>();
  public readonly testAttemptCache: EntityCache<TestAttempt> = new EntityCache<TestAttempt>();

  private _unit: Unit;

  constructor(data?: Project | Unit) {
    super();
    if (data instanceof Project) {
      this.project = data as Project;
    } else {
      this._unit = data as Unit;
    }
  }

  /**
   * Provide the project id to allow mapping in service.
   */
  public get projectId(): number {
    return this.project.id;
  }

  /**
   * Provide the task definition id to allow mapping in service.
   */
  public get taskDefId(): number {
    return this.definition.id;
  }

  public get comments(): readonly TaskComment[] {
    return this.commentCache.currentValues;
  }

  public addComment(textString): void {
    AppInjector.get(TaskCommentService)
      .addComment(this, textString, 'text')
      .subscribe({
        next: (tc) => {},
        error: (error) => {
          console.log(error);
        },
      });
  }

  public get unit(): Unit {
    if (this._unit) return this._unit;
    return this.project.unit;
  }

  /**
   * Determine if a task matches a given search text.
   *
   * @param matchText the text to search for
   * @returns true if this task should be shown for that match text
   */
  public matches(matchText: string): boolean {
    return (
      TaskStatus.STATUS_LABELS.get(this.status)?.toLowerCase().indexOf(matchText) >= 0 ||
      this.definition.abbreviation.toLowerCase().indexOf(matchText) >= 0 ||
      this.definition.name.toLowerCase().indexOf(matchText) >= 0 ||
      (this.hasExtensions && 'extension'.indexOf(matchText) == 0) ||
      (this.similarityFlag && 'similarity'.indexOf(matchText) == 0) ||
      this.project.matches(matchText)
    );
  }

  public hasTaskKey(key: {studentId: number; taskDefAbbr: string}): boolean {
    return this.taskKey() === key;
  }

  public taskKeyToUrlString(): string {
    const key = this.taskKey();
    return `${key.studentId}/${key.taskDefAbbr}`;
  }

  public get gradeWord(): string {
    if (this.grade) return Grade.GRADES[this.grade];
    else {
      return 'Not Graded';
    }
  }

  public gradeDesc(): string {
    return Grade.GRADE_ACRONYMS.get(this.grade);
  }

  public hasGrade(): boolean {
    return (
      this.grade !== undefined &&
      this.grade !== null &&
      TaskStatus.GRADEABLE_STATUSES.includes(this.status)
    );
  }

  public hasQualityPoints(): boolean {
    return this.definition.maxQualityPts > 0 && TaskStatus.GRADEABLE_STATUSES.includes(this.status);
  }

  public hasBeenGraded(): boolean {
    if (this.hasGrade()) {
      return typeof this.grade === 'number';
    }
    return false;
  }

  public hasBeenGivenQualityPoints(): boolean {
    return this.qualityPts > 0 || TaskStatus.GRADEABLE_STATUSES.includes(this.status);
  }

  public localDueDate(): Date {
    if (this.dueDate) {
      return this.dueDate;
    } else {
      return this.definition.localDueDate();
    }
  }

  public localDueDateString(): string {
    const locale: string = AppInjector.get(LOCALE_ID);
    return formatDate(this.localDueDate(), 'd MMM', locale);
  }

  public localDeadlineDate(): Date {
    return this.definition.localDeadlineDate();
  }

  /**
   * Calculate the time between two dates
   *
   * @param date1 days from this date
   * @param date2 to this date
   * @returns the time from date1 to date2
   */
  private timeBetween(date1: Date, date2: Date): number {
    return date2.getTime() - date1.getTime();
  }

  /**
   * Calculate the number of days between two dates
   *
   * @param date1 days from this date
   * @param date2 to this date
   * @returns the days from date1 to date2
   */
  private daysBetween(date1: Date, date2: Date): number {
    const diff = this.timeBetween(date1, date2);
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  public daysUntilDueDate(): number {
    return this.daysBetween(new Date(), this.localDueDate());
  }

  public daysUntilDeadlineDate(): number {
    return this.daysBetween(new Date(), this.localDeadlineDate());
  }

  public daysPastDueDate(): number {
    return this.daysBetween(this.localDueDate(), new Date());
  }

  public timePastDeadlineDate(): number {
    return this.timeBetween(this.localDeadlineDate(), new Date());
  }

  public isPastDeadline(): boolean {
    return this.timePastDeadlineDate() > 0 && !this.inSubmittedState();
  }

  public isDueSoon(): boolean {
    return this.daysUntilDueDate() <= 7 && this.timePastDueDate() < 0 && !this.inFinalState();
  }

  public isPastDueDate(): boolean {
    return this.timePastDueDate() > 0 && !this.inSubmittedState();
  }

  // Is the task past the deadline
  public isOverdue(): boolean {
    return this.daysUntilDueDate() < 0;
  }

  public isDueToday(): boolean {
    return this.daysUntilDueDate() == 0 && !this.inSubmittedState();
  }

  public timeUntilStartDate(): number {
    return this.timeBetween(new Date(), this.definition.startDate);
  }

  public daysUntilStartDate() {
    return this.daysBetween(new Date(), this.definition.startDate);
  }

  public isBeforeStartDate(): boolean {
    return this.timeUntilStartDate() > 0;
  }

  private timeToDescription(earlyTime: Date, laterTime: Date) {
    const times = [
      {period: 'weeks', value: 7 * 24 * 60 * 60 * 1000.0},
      {period: 'days', value: 24 * 60 * 60 * 1000.0},
      {period: 'hours', value: 60 * 60 * 1000.0},
      {period: 'minutes', value: 60 * 1000.0},
      {period: 'seconds', value: 1000.0},
    ];

    const timeDiff = laterTime.getTime() - earlyTime.getTime();

    if (timeDiff <= 0) {
      return '';
    }

    for (const data of times) {
      // exactDiff is floating point
      const exactDiff = timeDiff / data.value;
      const diff = Math.floor(exactDiff);

      // if days are more than 14 then show in week
      if (exactDiff > 2 && data.period === 'weeks') {
        return `${diff} Weeks`;
      } else if (diff > 1 && data.period !== 'weeks') {
        // Always show in days, Hours, Minutes and Seconds.
        return `${diff} ${data.period.charAt(0).toUpperCase() + data.period.substring(1)}`;
      } else if (diff === 1 && data.period !== 'weeks') {
        return `1 ${
          data.period.charAt(0).toUpperCase() + data.period.substring(1, data.period.length - 2)
        }`;
      }
    }

    return `${Math.floor(timeDiff / 1000)} Seconds`;
  }

  public timeToDue(): string {
    const days = this.daysUntilDueDate();
    if (days < 0) {
      return '!';
    } else if (days < 11) {
      return `${days}d`;
    } else {
      return `${Math.floor(days / 7)}w`;
    }
  }

  public timeUntilDueDateDescription() {
    return this.timeToDescription(new Date(), this.localDueDate());
  }

  public timePastDueDateDescription() {
    return this.timeToDescription(this.localDueDate(), new Date());
  }

  public timeToStart(): string {
    if (this.daysUntilStartDate() < 0) {
      return '';
    } else {
      const days = this.daysUntilStartDate();
      if (days < 7) {
        return `${days}d`;
      } else {
        return `${Math.floor(days / 7)}w`;
      }
    }
  }

  // Are we approaching the deadline?
  public isDeadlineSoon() {
    return (
      this.daysUntilDeadlineDate() <= 14 && this.timePastDeadlineDate() < 0 && !this.inFinalState()
    );
  }

  public betweenDueDateAndDeadlineDate(): boolean {
    const now = new Date().getTime();

    return now > this.localDueDate().getTime() && now < this.localDeadlineDate().getTime();
  }

  public timePastDueDate() {
    return this.timeBetween(this.localDueDate(), new Date());
  }

  private hoursBetween(time1: Date, time2: Date): number {
    return Math.floor(Math.abs(time1.getTime() - time2.getTime()) / 1000 / 60 / 60);
  }

  public refresh(): void {
    const taskService: TaskService = AppInjector.get(TaskService);
    taskService.refreshExtensionDetails(this);
  }

  public refreshCommentData(): void {
    const comments: readonly TaskComment[] = this.comments;
    if (comments.length === 0) return;

    comments[0].shouldShowTimestamp = true;

    for (let i = 0; i < comments.length; i++) {
      const authorID = comments[i].author.id;
      const timeOfMessage = comments[i].createdAt;

      if (i < comments.length - 1) {
        // if the comment is proceeded by a different author's comment, or the time between comments
        // is significant, mark it as start of end of series, then start a new series proceeding.
        if (
          authorID !== comments[i + 1]?.author.id ||
          this.hoursBetween(timeOfMessage, comments[i + 1].createdAt) > 3
        ) {
          // IDs match
          comments[i].shouldShowAvatar = true;
          comments[i + 1].shouldShowTimestamp = true;
        } else {
          comments[i].shouldShowAvatar = false;
          comments[i + 1].shouldShowTimestamp = false;
        }
      }

      // if the comment is preceeded by a non-content comment, mark it as start of series.
      comments[i].firstInSeries =
        comments[i].isBubbleComment && (i === 0 || !comments[i - 1].isBubbleComment);

      // if the comment is proceeded by a non-conent comment, mark it as end of series.
      if (comments[i].isBubbleComment && !comments[i + 1]?.isBubbleComment) {
        comments[i].shouldShowAvatar = true;
      }

      // Link in original messages for replies
      if (comments[i].replyToId) {
        comments[i].originalComment = comments.find((tc) => tc.id === comments[i].replyToId);
      }

      // Scorm series
      if (comments[i].commentType === 'scorm') {
        comments[i].firstInSeries = i === 0 || comments[i - 1].commentType !== 'scorm';
        (comments[i] as ScormComment).lastInScormSeries =
          i + 1 === comments.length || comments[i + 1]?.commentType !== 'scorm';
        if (!comments[i].firstInSeries) comments[i].shouldShowTimestamp = false;
      }
    }

    comments[comments.length - 1].shouldShowAvatar = true;
    comments;
  }

  public taskKey(): {studentId: number; taskDefAbbr: string} {
    return {
      studentId: this.project.student.id,
      taskDefAbbr: this.definition.abbreviation,
    };
  }

  public taskKeyToIdString(): string {
    const key = this.taskKey();
    return `task-key-${key.studentId}-${key.taskDefAbbr}`.replace(/[.# ]/g, '-');
  }

  public get similaritiesDetected(): boolean {
    return this.similarityFlag;
  }

  public getSimilarityData(match: number): Observable<unknown> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.get(
      `${AppInjector.get(DoubtfireConstants).API_URL}/tasks/${this.id}/similarity/${match}`,
    );
  }

  public updateSimilarity(match: number, other: any, dismissed: boolean): Observable<any> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.put(
      `${AppInjector.get(DoubtfireConstants).API_URL}/tasks/${this.id}/similarity/${match}`,
      {
        dismissed: dismissed,
        other: other,
      },
    );
  }

  public inFinalState(): boolean {
    return TaskStatus.FINAL_STATUSES.includes(this.status);
  }

  public inCompleteState(): boolean {
    return this.status === 'complete';
  }

  public inDiscussState(): boolean {
    return TaskStatus.DISCUSSION_STATES.includes(this.status);
  }

  public inTimeExceeded(): boolean {
    return this.status === 'time_exceeded';
  }

  public inStateThatAllowsExtension(): boolean {
    return TaskStatus.STATE_THAT_ALLOWS_EXTENSION.includes(this.status);
  }

  public isValidTopTask(): boolean {
    return TaskStatus.VALID_TOP_TASKS.includes(this.status);
  }

  public inSubmittedState(): boolean {
    return TaskStatus.SUBMITTED_STATUSES.includes(this.status);
  }

  public inAwaitingFeedbackState(): boolean {
    return this.status === 'ready_for_feedback';
  }

  public statusLabel(): string {
    return TaskStatus.STATUS_LABELS.get(this.status);
  }

  public statusIcon(): string {
    return TaskStatus.STATUS_ICONS.get(this.status);
  }

  public statusClass(): string {
    return TaskStatus.statusClass(this.status);
  }

  public statusHelp(): {detail: string; reason: string; action: string} {
    return TaskStatus.HELP_DESCRIPTIONS.get(this.status);
  }

  public filterFutureStates(states: TaskStatusUiData[]): TaskStatusUiData[] {
    return states.filter((s: TaskStatusUiData): boolean => {
      const rejectStates = TaskStatus.REJECT_FUTURE_STATES.get(this.status);
      return !rejectStates.includes(s.status);
    });
  }

  public isGroupTask(): boolean {
    return this.definition.isGroupTask();
  }

  public getSubmissionDetails(): Observable<Task> {
    const http: HttpClient = AppInjector.get(HttpClient);

    return http
      .get(
        `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${this.project.id}/task_def_id/${
          this.definition.id
        }/submission_details`,
      )
      .pipe(
        map((response: object) => {
          this.hasPdf = response['has_pdf'];
          this.processingPdf = response['processing_pdf'];
          this.submissionDate = MappingFunctions.mapDate(response, 'submission_date', this);
          return this;
        }),
      );
  }

  public get overseerEnabled(): boolean {
    return (
      this.unit.overseerEnabled &&
      this.definition.assessmentEnabled &&
      this.definition.hasTaskAssessmentResources
    );
  }

  public get scormEnabled(): boolean {
    return this.definition.scormEnabled && this.definition.hasScormData;
  }

  public get scormPassed(): boolean {
    if (this.latestCompletedTestAttempt) {
      return this.latestCompletedTestAttempt.successStatus;
    }
    return false;
  }

  /**
   * Launch the SCORM player for this task in a new window.
   */
  public launchScormPlayer(): void {
    const url = `#/projects/${this.project.id}/task_def_id/${this.taskDefId}/scorm-player/normal`;
    window.open(url, '_blank');
  }

  public get isReadyForUpload(): boolean {
    return !this.scormEnabled || this.definition.scormBypassTest || this.scormPassed;
  }

  public get latestCompletedTestAttempt(): TestAttempt {
    return this.testAttemptCache.currentValues.find((attempt) => attempt.terminated);
  }

  public submissionUrl(asAttachment: boolean = false): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${
      this.project.id
    }/task_def_id/${this.definition.id}/submission${asAttachment ? '?as_attachment=true' : ''}`;
  }

  public testSubmissionUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/task_definitions/${
      this.definition.id
    }/test_overseer_assessment`;
  }

  public submittedFilesUrl(asAttachment: boolean = false): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${
      this.project.id
    }/task_def_id/${this.definition.id}/submission_files${
      asAttachment ? '?as_attachment=true' : ''
    }`;
  }

  public recreateSubmissionPdf(): Observable<object> {
    const httpClient: HttpClient = AppInjector.get(HttpClient);
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${
      this.project.id
    }/task_def_id/${this.definition.id}/submission`;

    return httpClient.put(url, {});
  }

  public requiresFileUpload(): boolean {
    return this.definition.uploadRequirements.length > 0;
  }

  public presentTaskSubmissionModal(
    status: TaskStatusEnum,
    reuploadEvidence: boolean = false,
    isTestSubmission: boolean = false,
  ) {
    const oldStatus = this.status;

    if (!isTestSubmission) {
      this.status = status;
    }
    const uploadModal: any = AppInjector.get(uploadSubmissionModal);

    const modal = uploadModal.show(this, reuploadEvidence, isTestSubmission);
    // Modal failed to present
    if (!modal) {
      if (!isTestSubmission) {
        this.status = oldStatus;
      }
      return;
    }

    modal.result.then(
      // Grade was selected (modal closed with result)
      (response) => {},
      // Grade was not selected (modal was dismissed)
      (_dismissed) => {
        if (!isTestSubmission) {
          this.status = oldStatus;
        }
        const alerts: any = AppInjector.get(AlertService);
        alerts.message('Submission cancelled. Status was reverted.', 6000);
      }
    );
  }

  public processTaskStatusChange(expectedStatus: TaskStatusEnum, alerts: AlertService) {
    if (this.inTimeExceeded() && !this.isPastDeadline()) {
      alerts.message(
        'You have submitted after the deadline for feedback. Your task will not be reviewed by a tutor. It is now your responsibility to ensure this task meets the required standard.',
        8000,
      );
    }

    if (this.status !== expectedStatus) {
      alerts.message(`Status changed to ${this.statusLabel()}.`, 4000);
    } else {
      alerts.success(`Status changed to ${this.statusLabel()}.`);
    }
  }

  public updateTaskStatus(status: TaskStatusEnum) {
    const oldStatus = this.status;
    const alerts: AlertService = AppInjector.get(AlertService);

    const updateFunc = () => {
      const taskService: TaskService = AppInjector.get(TaskService);
      const options: RequestOptions<Task> = {
        entity: this,
        cache: this.project.taskCache,
        body: {
          trigger: status,
          grade: this.grade,
          quality_pts: this.qualityPts,
        },
      };
      const hasId: boolean = this.id > 0;

      taskService
        .update(
          {
            projectId: this.project.id,
            taskDefId: this.definition.id,
          },
          options,
        )
        .subscribe({
          next: (response) => {
            if (!hasId && this.id > 0) {
              this.project.taskCache.delete(this.definition.abbreviation);
              this.project.taskCache.add(this);
            }
            this.processTaskStatusChange(status, alerts);
          },
          error: (error) => {
            this.status = oldStatus;
            alerts.error(error, 6000);
          },
        });
    }; // end update function

    // Must provide grade if graded and in a final complete state - so use callback to run update function
    if ((this.definition.isGraded || this.definition.maxQualityPts > 0) && TaskStatus.GRADEABLE_STATUSES.includes(status)) {
      const gradeModal: GradeTaskModalService = AppInjector.get(GradeTaskModalService);
      gradeModal.show(this,
        // Grade was selected (modal closed with result)
        (response) => {
          this.grade = response.grade;
          this.qualityPts = response.qualityPts;
          updateFunc();
        },
        // Grade was not selected (modal was dismissed)
        () => {
          this.status = oldStatus;
          alerts.message('Status reverted, as no grade was specified', 6000);
        },
      );
    } else {
      updateFunc();
    }
  }

  public triggerTransition(status: TaskStatusEnum): void {
    if (this.status === status) return;
    const alerts: AlertService = AppInjector.get(AlertService);

    const requiresFileUpload =
      ['ready_for_feedback', 'need_help'].includes(status) && this.requiresFileUpload();

    if (requiresFileUpload && this.isReadyForUpload) {
      this.presentTaskSubmissionModal(status);
    } else if (requiresFileUpload && !this.isReadyForUpload) {
      alerts.error('Complete Knowledge Check first to submit files', 6000);
    } else {
      this.updateTaskStatus(status);
    }
  }

  public staffAlignments() {
    return this.unit.staffAlignmentsForTaskDefinition(this.definition);
  }

  public shortTutorialDescription(): string {
    const stream = this.definition.tutorialStream;
    const tutorial = this.project.tutorialForStream(stream);
    if (tutorial) {
      return tutorial.abbreviation;
    } else {
      return 'None';
    }
  }

  public get group(): Group {
    return this.project.getGroupForTask(this);
  }

  public pin(): void {
    const http = AppInjector.get(HttpClient);

    http.post(`${AppInjector.get(DoubtfireConstants).API_URL}/tasks/${this.id}/pin`, {}).subscribe({
      next: (data) => {
        this.pinned = true;
      },
      error: (message) => {
        (AppInjector.get(AlertService) as AlertService).error(message, 6000);
      },
    });
  }

  public unpin(): void {
    const http = AppInjector.get(HttpClient);

    http
      .delete(`${AppInjector.get(DoubtfireConstants).API_URL}/tasks/${this.id}/pin`, {})
      .subscribe({
        next: (_data) => {
          this.pinned = false;
        },
        error: (message) => {
          (AppInjector.get(AlertService) as AlertService).error(message, 6000);
        },
      });
  }

  public canApplyForExtension(): boolean {
    return (
      this.unit.allowStudentExtensionRequests &&
      this.inStateThatAllowsExtension() &&
      (!this.isPastDeadline() || this.wasSubmittedOnTime()) &&
      this.maxWeeksCanExtend() > 0
    );
  }

  public wasSubmittedOnTime() {
    return (
      this.submissionDate &&
      this.submissionDate.getTime() <= this.definition.finalDeadlineDate().getTime()
    );
  }

  public maxWeeksCanExtend(): number {
    return Math.ceil(
      this.daysBetween(this.localDueDate(), this.definition.localDeadlineDate()) / 7,
    );
  }

  /**
   * Returns the minimum number of weeks the task must be extended to be
   * able to available for tutors to provide feedback.
   */
  public minWeeksCanExtend(): number {
    const minWeeks = Math.ceil(this.daysBetween(this.localDueDate(), new Date()) / 7);
    if (minWeeks < 0) {
      return 0;
    } else {
      return minWeeks;
    }
  }

  /**
   * Fetch the task similarities for this task.
   */
  public fetchSimilarities(): Observable<TaskSimilarity[]> {
    const taskSimilarityService: TaskSimilarityService = AppInjector.get(TaskSimilarityService);
    return taskSimilarityService.query(
      {taskId: this.id},
      {
        cache: this.similarityCache,
        constructorParams: this,
      },
    );
  }

  /**
   * Fetch the SCORM test attempts for this task.
   */
  public fetchTestAttempts(): Observable<TestAttempt[]> {
    const testAttemptService: TestAttemptService = AppInjector.get(TestAttemptService);
    return testAttemptService.query(
      {
        project_id: this.project.id,
        task_def_id: this.taskDefId,
      },
      {
        cache: this.testAttemptCache,
        constructorParams: this,
      },
    );
  }
}
