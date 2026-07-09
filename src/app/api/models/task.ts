import {Entity, EntityCache, RequestOptions} from 'ngx-entity-service';
import {formatDate} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {LOCALE_ID} from '@angular/core';
import {Observable, firstValueFrom, map} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GradeTaskModalService} from 'src/app/tasks/modals/grade-task-modal/grade-task-modal.service';
import {UploadSubmissionModalService} from 'src/app/tasks/modals/upload-submission-modal/upload-submission-modal.service';
import {MappingFunctions} from '../services/mapping-fn';
import {TutorNoteService} from '../services/tutor-note.service';
import {
  Group,
  Project,
  ScormComment,
  TaskComment,
  TaskCommentService,
  TaskDefinition,
  TaskService,
  TaskSimilarity,
  TaskSimilarityService,
  TaskStatus,
  TaskStatusEnum,
  TaskStatusUiData,
  TestAttempt,
  TestAttemptService,
  Unit,
  UnitRole,
  UnitRoleService,
  UserService,
} from './doubtfire-model';
import {TaskPrerequisite} from './task-prerequisite';

export const FeedbackModerationAction = {
  ShowMore: 'show_more',
  ShowLess: 'show_less',
  DismissOk: 'dismiss_ok',
  DismissGood: 'dismiss_good',
  Upheld: 'upheld',
  Overturn: 'overturn',
  Snooze: 'snooze',
} as const;

export type FeedbackModerationActionType =
  (typeof FeedbackModerationAction)[keyof typeof FeedbackModerationAction];

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

  moderationType: 'random_sample' | 'escalation' | 'first_feedback';

  project: Project;
  definition: TaskDefinition;
  tutorialId: number;

  //TODO: map task submission details
  hasPdf: boolean = false;
  processingPdf: boolean = false;
  claimedByUnitRoleId: number | null;

  loadingSubmissionDetails: boolean = false;

  pinned: boolean = false;
  hover?: boolean;
  optionsOpened?: boolean;

  targetStartDate: Date;
  targetDueDate: Date;

  public topWeight: number = 0;
  public readonly commentCache: EntityCache<TaskComment> = new EntityCache<TaskComment>();

  public readonly similarityCache: EntityCache<TaskSimilarity> = new EntityCache<TaskSimilarity>();
  public readonly testAttemptCache: EntityCache<TestAttempt> = new EntityCache<TestAttempt>();

  suggestedTaskStatus;

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

  public get hasDiscussedInClassComment(): boolean {
    return this.comments.some((comment) => comment.commentType === 'discussed_in_class');
  }

  public get requiresDiscussionForComplete(): boolean {
    return !!this.definition?.requiresDiscussion;
  }

  public get canMarkComplete(): boolean {
    return !this.requiresDiscussionForComplete || this.hasDiscussedInClassComment;
  }

  public get latestReadyForFeedbackAt(): Date | null {
    return this.submissionDate ? new Date(this.submissionDate) : null;
  }

  public get tutor(): UnitRole {
    const enrolments = this.project.tutorialEnrolmentsCache.currentValues.filter(
      (t) => t.tutorialStream.name === this.definition.tutorialStream.name,
    );
    if (enrolments.length === 1) {
      const user = enrolments[0].tutor;
      return this.unit.staff.find((ur) => ur.user.id === user.id);
    }
  }

  public addComment(textString): void {
    AppInjector.get(TaskCommentService)
      .addComment(this, textString, 'text')
      .subscribe({
        error: (error) => {
          const alerts: AlertService = AppInjector.get(AlertService);
          alerts.error(`Failed to add comment: ${error}`);
        },
      });
  }

  private commentsSinceLatestReadyForFeedback(): readonly TaskComment[] {
    const latestReadyForFeedbackAt = this.latestReadyForFeedbackAt?.getTime();
    if (!latestReadyForFeedbackAt) {
      return this.comments;
    }

    return this.comments.filter((comment) => {
      const createdAt = comment.createdAt ? new Date(comment.createdAt).getTime() : NaN;
      return Number.isFinite(createdAt) && createdAt >= latestReadyForFeedbackAt;
    });
  }

  public get unit(): Unit {
    if (this._unit) {
      return this._unit;
    }
    return this.project.unit;
  }

  private getBreakOverlapMilliseconds(
    startTime: number,
    endTime: number,
    breaks: readonly {startDate: Date; numberOfWeeks: number}[],
  ): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    return breaks.reduce((overlap, teachingBreak) => {
      const breakStart = new Date(teachingBreak.startDate).getTime();
      const breakDuration = (teachingBreak.numberOfWeeks ?? 0) * 7 * millisecondsPerDay;
      const breakEnd = breakStart + breakDuration;

      if (!Number.isFinite(breakStart) || breakDuration <= 0) {
        return overlap;
      }

      const overlapStart = Math.max(startTime, breakStart);
      const overlapEnd = Math.min(endTime, breakEnd);

      return overlap + Math.max(0, overlapEnd - overlapStart);
    }, 0);
  }

  public daysSinceSubmission(nowTime = Date.now()): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const submissionTime = new Date(this.submissionDate).getTime();

    if (!Number.isFinite(submissionTime) || nowTime <= submissionTime) {
      return 0;
    }

    const teachingBreaks = this.unit.teachingPeriod?.breaks ?? [];
    const pausedMilliseconds = this.getBreakOverlapMilliseconds(
      submissionTime,
      nowTime,
      teachingBreaks,
    );

    return Math.floor(
      Math.max(0, nowTime - submissionTime - pausedMilliseconds) / millisecondsPerDay,
    );
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
    if (!key) {
      return false;
    }

    const taskKey = this.taskKey();
    return (
      taskKey?.studentId?.toString() === key.studentId?.toString() &&
      taskKey?.taskDefAbbr === key.taskDefAbbr
    );
  }

  public taskKeyToUrlString(): string {
    const key = this.taskKey();
    return `${key.studentId}/${key.taskDefAbbr}`;
  }

  public get gradeWord(): string {
    if (this.grade !== undefined && this.grade !== null) {
      return this.unit.gradeLabel(this.grade);
    } else {
      return 'Not Graded';
    }
  }

  public gradeDesc(): string {
    return this.unit.gradeAbbreviation(this.grade);
  }

  public hasGrade(): boolean {
    return (
      this.grade !== undefined &&
      this.grade !== null &&
      TaskStatus.GRADEABLE_STATUSES.includes(this.status)
    );
  }

  public hasQualityPoints(): boolean {
    return (
      this.definition.maxQualityPts > 0 &&
      this.qualityPts >= 0 &&
      TaskStatus.GRADEABLE_STATUSES.includes(this.status)
    );
  }

  public hasBeenGraded(): boolean {
    if (this.hasGrade()) {
      return typeof this.grade === 'number';
    }
    return false;
  }

  public hasBeenGivenQualityPoints(): boolean {
    return this.definition.maxQualityPts > 0 && this.qualityPts >= 0;
  }

  public localDueDate(): Date {
    if (this.unit.allowFlexibleDates) {
      if (this.targetDueDate) {
        // Student's custom planned date
        return this.targetDueDate;
      }

      const gradeTargetDate = this.definition.gradeTargetDate(this.project.targetGrade);
      if (gradeTargetDate) {
        return gradeTargetDate;
      }
    }

    if (this.dueDate) {
      return this.dueDate;
    }

    return this.definition.localDueDate();
  }

  public localDueDateString(): string {
    const locale: string = AppInjector.get(LOCALE_ID);
    return formatDate(this.localDueDate(), 'd MMM', locale);
  }

  public localDeadlineDateString(): string {
    const locale: string = AppInjector.get(LOCALE_ID);
    return formatDate(this.localDeadlineDate(), 'd MMM', locale);
  }

  public get dueWeek(): number {
    const startDate: Date = this.unit.startDate;
    const dueDate: Date = this.localDueDate();
    const diffInMs: number = dueDate.getTime() - startDate.getTime();
    const diffInDays: number = Math.ceil(diffInMs / (1000 * 3600 * 24));

    return Math.ceil(diffInDays / 7);
  }

  /**
   * Set the task to be due in a specific week.
   *
   * @returns the new due week
   */
  public set dueWeek(week: number) {
    // Get original due week and current due week
    const tdDueWeek: number = this.definition.dueWeek;
    const currentDueWeek = this.dueWeek;

    // Determine how long the extension needs to be
    this.extensions = week - tdDueWeek;

    // Map to ms to adjust due date
    const currentWeekDueMs = MappingFunctions.weeksMs(currentDueWeek);
    const newWeekDueMs = MappingFunctions.weeksMs(week);

    // Adjust due date based on difference in current and new due weeks
    this.dueDate = new Date(this.localDueDate().getTime() - currentWeekDueMs + newWeekDueMs);
  }

  public localDeadlineDate(): Date {
    return MappingFunctions.addDays(this.definition.localDeadlineDate(), this.project.specConDays);
  }

  public savePlannedDate(): Observable<Task> {
    const taskService: TaskService = AppInjector.get(TaskService);

    return taskService.update(
      {
        projectId: this.project.id,
        taskDefId: this.definition.id,
      },
      {
        endpointFormat: '/projects/:projectId:/task_def_id/:taskDefId:/plan',
        entity: this,
        body: {
          extensions: this.extensions,
        },
      },
    );
  }

  public saveTargetDates(startDate: Date | string, dueDate: Date | string): Observable<Task> {
    const taskService: TaskService = AppInjector.get(TaskService);

    return taskService.update(
      {
        projectId: this.project.id,
        taskDefId: this.definition.id,
      },
      {
        endpointFormat: '/projects/:projectId:/task_def_id/:taskDefId:/target_dates',
        entity: this,
        body: {
          target_start_date: startDate,
          target_due_date: dueDate,
        },
      },
    );
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

  public get startDate(): Date {
    if (this.unit.allowFlexibleDates) {
      if (this.targetStartDate) {
        return this.targetStartDate;
      }

      const gradeStartDate = this.definition.gradeStartDate(this.project.targetGrade);
      if (gradeStartDate) {
        return gradeStartDate;
      }
    }

    if (this.extensions < 0) {
      // If the task has an extension, the start date is the due date minus the extension
      return MappingFunctions.addWeeks(this.definition.startDate, this.extensions);
    } else {
      // If the task does not have an extension, the start date is the definition's start date
      return this.definition.startDate;
    }
  }

  public timeUntilStartDate(): number {
    return this.timeBetween(new Date(), this.startDate);
  }

  public daysUntilStartDate() {
    return this.daysBetween(new Date(), this.startDate);
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
        return `1 ${data.period.charAt(0).toUpperCase() + data.period.slice(1, -1)}`;
      }
    }

    return `${Math.floor(timeDiff / 1000)} Seconds`;
  }

  public timeToDue(): string {
    const days = this.daysUntilDueDate();
    if (days <= 0) {
      return 'Past Due Date';
    } else if (days < 11) {
      return `Due in ${this.timeUntilDueDateDescription()}`;
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
    if (comments.length === 0) {
      return;
    }

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
        if (!comments[i].firstInSeries) {
          comments[i].shouldShowTimestamp = false;
        }
      }
    }

    comments[comments.length - 1].shouldShowAvatar = true;
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

  public getSimilarityData(match: number): Observable<object> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.get(
      `${AppInjector.get(DoubtfireConstants).API_URL}/tasks/${this.id}/similarity/${match}`,
    );
  }

  public updateSimilarity(match: number, other: object, dismissed: boolean): Observable<object> {
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
    return TaskStatus.STATUS_MATERIAL_ICONS.get(this.status);
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
    this.loadingSubmissionDetails = true;
    return http
      .get(
        `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${this.project.id}/task_def_id/${
          this.definition.id
        }/submission_details`,
      )
      .pipe(
        map((response: object) => {
          this.loadingSubmissionDetails = false;
          this.hasPdf = response['has_pdf'];
          this.processingPdf = response['processing_pdf'];
          this.submissionDate = MappingFunctions.mapDate(response, 'submission_date', this);
          if (response['task_status'] && TaskStatus.STATUS_KEYS.includes(response['task_status'])) {
            this.status = response['task_status'];
          }
          if ('claimed_by_unit_role_id' in response) {
            this.claimedByUnitRoleId = response['claimed_by_unit_role_id'] as number | null;
          }
          return this;
        }),
      );
  }

  private mapUnitTaskPrerequisites(prerequisites: TaskPrerequisite[]): TaskPrerequisite[] {
    const definitions = this.unit.taskDefinitions;

    return prerequisites.map((prerequisite) => {
      prerequisite.taskDefinition = definitions.find(
        (td) => td.id === prerequisite.taskDefinitionId,
      );
      prerequisite.prerequisite = definitions.find((td) => td.id === prerequisite.prerequisiteId);
      return prerequisite;
    });
  }

  private buildProjectTaskForDefinition(definition: TaskDefinition): Task {
    const dependentTask = new Task(this.project);
    dependentTask.project = this.project;
    dependentTask.definition = definition;
    return dependentTask;
  }

  private async dependentTaskNeedsRecursiveFix(definition: TaskDefinition): Promise<boolean> {
    const cachedTask = this.project.findTaskForDefinition(definition.id);
    if (cachedTask) {
      return cachedTask.status === 'ready_for_feedback';
    }

    const dependentTask = this.buildProjectTaskForDefinition(definition);
    const taskWithSubmissionDetails = await firstValueFrom(dependentTask.getSubmissionDetails());
    return taskWithSubmissionDetails.status === 'ready_for_feedback';
  }

  public async hasReadyForFeedbackDependents(): Promise<boolean> {
    const allPrerequisites = await firstValueFrom(this.unit.getTaskPrerequisites());
    const dependentPrerequisites = this.mapUnitTaskPrerequisites(allPrerequisites).filter(
      (prerequisite) => prerequisite.prerequisiteId === this.definition.id,
    );

    for (const prerequisite of dependentPrerequisites) {
      if (!prerequisite.taskDefinition) {
        continue;
      }

      const shouldTriggerRecursiveFix = await this.dependentTaskNeedsRecursiveFix(
        prerequisite.taskDefinition,
      );
      if (shouldTriggerRecursiveFix) {
        return true;
      }
    }

    return false;
  }

  public get overseerEnabled(): boolean {
    return this.unit.overseerEnabled && this.definition.assessmentEnabled;
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
    const url = `/projects/${this.project.id}/task_def_id/${this.taskDefId}/scorm-player/normal`;
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
    const uploadModal: UploadSubmissionModalService = AppInjector.get(UploadSubmissionModalService);

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
      (_response) => {
        /* empty */
      },
      // Grade was not selected (modal was dismissed)
      (_dismissed) => {
        if (!isTestSubmission) {
          this.status = oldStatus;
        }
        const alerts: AlertService = AppInjector.get(AlertService);
        alerts.message('Submission cancelled. Status was reverted.', 6000);
      },
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
    this.getSubmissionDetails().subscribe();
    const taskService: TaskService = AppInjector.get(TaskService);
    taskService.notifyStatusChange(this);
  }

  public async markAsDiscussed(reasonText?: string) {
    const alerts: AlertService = AppInjector.get(AlertService);
    const taskService: TaskService = AppInjector.get(TaskService);

    const markDiscussed = () => {
      const options: RequestOptions<Task> = {
        entity: this,
        cache: this.project.taskCache,
        body: {
          discussed: true,
        },
      };

      taskService
        .update(
          {
            projectId: this.project.id,
            taskDefId: this.definition.id,
          },
          options,
        )
        .subscribe({
          next: (_response) => {
            taskService.notifyStatusChange(this);
            alerts.success('Task successfully marked as discussed in class.', 4000);
          },
          error: (error) => {
            alerts.error(error, 6000);
          },
        });
    };

    if (reasonText) {
      const prefix = `I'm manually marking this discussed in class because...`;
      const trimmedReason = reasonText.trim();
      const noteText = trimmedReason.startsWith(prefix)
        ? trimmedReason
        : `${prefix} ${trimmedReason}`;
      const currentUser = AppInjector.get(UserService).currentUser;
      const currentUnitRole = this.unit.staff.find(
        (unitRole) => unitRole.user.id === currentUser.id,
      );

      if (!currentUnitRole) {
        alerts.error(
          'Unable to find your staff role, so the tutor note could not be recorded.',
          6000,
        );
        return;
      }

      AppInjector.get(TutorNoteService)
        .addNote(currentUnitRole, noteText, this)
        .subscribe({
          next: () => {
            markDiscussed();
          },
          error: (error) => {
            alerts.error(`Unable to save the required tutor note: ${error}`, 6000);
          },
        });
      return;
    }

    markDiscussed();
  }

  public async updateTaskStatus(
    status: TaskStatusEnum,
    markAsDiscussed?: boolean,
    triggerRecursiveFix?: boolean,
  ) {
    const oldStatus = this.status;
    const oldGrade = this.grade;
    const oldQualityPts = this.qualityPts;
    const alerts: AlertService = AppInjector.get(AlertService);

    if (status === 'complete' && !this.canMarkComplete) {
      alerts.error('This task must be discussed in class before it can marked complete.', 6000);
      return;
    }

    const updateFunc = (grade = this.grade, qualityPts = this.qualityPts) => {
      const taskService: TaskService = AppInjector.get(TaskService);
      const options: RequestOptions<Task> = {
        entity: this,
        cache: this.project.taskCache,
        body: {
          trigger: status,
          grade: grade,
          quality_pts: qualityPts,
        },
      };

      if (markAsDiscussed === true) {
        options.body['discussed'] = true;
      }

      if (triggerRecursiveFix === true) {
        options.body['trigger_recursive_fix'] = true;
      }

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
          next: (_response) => {
            this.grade = grade;
            this.qualityPts = qualityPts;
            if (!hasId && this.id > 0) {
              this.project.taskCache.delete(this.definition.abbreviation);
              this.project.taskCache.add(this);
            }
            this.processTaskStatusChange(status, alerts);
            taskService.notifyStatusChange(this);
          },
          error: (error) => {
            this.status = oldStatus;
            this.grade = oldGrade;
            this.qualityPts = oldQualityPts;
            alerts.error(error, 6000);
          },
        });
    }; // end update function

    // Must provide grade if graded and in a final complete state - so use callback to run update function
    if (
      (this.definition.isGraded || this.definition.maxQualityPts > 0) &&
      TaskStatus.GRADEABLE_STATUSES.includes(status)
    ) {
      const gradeModal: GradeTaskModalService = AppInjector.get(GradeTaskModalService);
      gradeModal.show(
        this,
        // Grade was selected (modal closed with result)
        (response) => {
          updateFunc(response.grade, response.qualityPts);
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

  public async triggerTransition(status: TaskStatusEnum): Promise<void> {
    if (this.status === status) {
      return;
    }
    const alerts: AlertService = AppInjector.get(AlertService);

    const requiresFileUpload =
      ['ready_for_feedback', 'need_help', 'assess_in_portfolio'].includes(status) &&
      this.requiresFileUpload();

    if (requiresFileUpload && this.isReadyForUpload) {
      this.presentTaskSubmissionModal(status);
    } else if (requiresFileUpload && !this.isReadyForUpload) {
      alerts.error('Complete Knowledge Check first to submit files', 6000);
    } else {
      await this.updateTaskStatus(status);
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

  public pin(onSuccess?: () => void): void {
    const http = AppInjector.get(HttpClient);

    http.post(`${AppInjector.get(DoubtfireConstants).API_URL}/tasks/${this.id}/pin`, {}).subscribe({
      next: (_data) => {
        this.pinned = true;
        onSuccess?.();
      },
      error: (message) => {
        (AppInjector.get(AlertService) as AlertService).error(message, 6000);
      },
    });
  }

  public unpin(onSuccess?: () => void): void {
    const http = AppInjector.get(HttpClient);

    http
      .delete(`${AppInjector.get(DoubtfireConstants).API_URL}/tasks/${this.id}/pin`, {})
      .subscribe({
        next: (_data) => {
          this.pinned = false;
          onSuccess?.();
        },
        error: (message) => {
          (AppInjector.get(AlertService) as AlertService).error(message, 6000);
        },
      });
  }

  public canApplyForExtension(): boolean {
    return (
      (this.unit.allowStudentExtensionRequests || this.unit.currentUserIsStaff) &&
      !this.unit.allowFlexibleDates &&
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
    return Math.ceil(this.daysBetween(this.localDueDate(), this.localDeadlineDate()) / 7);
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

  public hasPrerequisiteTasks(): boolean {
    if (!this.project) {
      return false;
    }
    return this.definition.taskPrerequisitesCache.currentValues.length > 0;
  }

  /**
   * Returns true if this task has prerequisite tasks that are not in a submitted state
   */
  public blockedByPrerequisiteTasks(): boolean {
    if (!this.project) {
      return false;
    }

    const prereqs = this.definition.taskPrerequisitesCache.currentValues;
    if (!prereqs.length) {
      return false;
    }

    for (const prerequisiteLink of prereqs) {
      const prerequisiteTask = prerequisiteLink.prerequisite;
      const task = this.project.tasks.find((t) => t.definition.id === prerequisiteTask.id);

      // If the task doesnt exist or its state has not met the minimum require state, block submission
      if (!task || !prerequisiteLink.hasMetRequiredState(this.project)) {
        return true;
      }
    }

    return false;
  }

  public moderateFeedback(
    action: FeedbackModerationActionType,
    applyToAll: boolean = false,
  ): Observable<boolean> {
    const unitRoleService: UnitRoleService = AppInjector.get(UnitRoleService);

    const tutor = this.tutor;
    if (!tutor) {
      return;
    }

    return unitRoleService.post(
      {
        id: tutor.id,
        taskId: this.id,
      },
      {
        endpointFormat: '/unit_roles/:id:/moderation/:taskId:',
        body: {
          action,
          apply_to_all: applyToAll,
        },
      },
    );
  }

  public requestFeedbackReview(): Observable<boolean> {
    const httpClient: HttpClient = AppInjector.get(HttpClient);
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${
      this.project.id
    }/task_def_id/${this.definition.id}/feedback_review`;

    return httpClient.post<boolean>(url, {});
  }
}
