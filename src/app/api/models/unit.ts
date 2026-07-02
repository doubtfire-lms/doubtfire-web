import {Entity, EntityCache, EntityMapping} from 'ngx-entity-service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GroupService} from '../services/group.service';
import {MarkingSessionService} from '../services/marking-session.service';
import {ProjectService} from '../services/project.service';
import {TaskDefinitionService} from '../services/task-definition.service';
import {TaskPrerequisiteService} from '../services/task-prerequisite.service';
import {D2lAssessmentMapping} from './d2l/d2l_assessment_mapping';
import {
  Campus,
  D2lAssessmentMappingService,
  Group,
  GroupMembership,
  GroupSet,
  OverseerImage,
  Project,
  Task,
  TaskDefinition,
  TaskOutcomeAlignment,
  TeachingPeriod,
  Tutorial,
  TutorialStream,
  TutorialStreamService,
  UnitRole,
  UnitRoleService,
  UnitService,
  User,
} from './doubtfire-model';
import {LearningOutcome} from './learning-outcome';
import {MarkingSession} from './marking-session';
import {SidekiqJob} from './sidekiq-job';
import {TaskPrerequisite} from './task-prerequisite';

export interface GradeDefinition {
  id: string;
  value: number;
  label: string;
  abbreviation: string;
}

export class Unit extends Entity {
  id: number;
  code: string;
  name: string;
  description: string;

  active: boolean;

  myRole: string; //TODO: add more type details?
  unitRole: UnitRole; // mapped unit role during admin edits
  mainConvenor: UnitRole;

  /**
   * The main convenor user for the unit
   * ONLY UPDATED ON QUERY - when unit role is not available
   */
  mainConvenorUser: User;

  teachingPeriod: TeachingPeriod;
  startDate: Date; //TODO: or string
  endDate: Date; //TODO: or string
  portfolioAutoGenerationDate: Date;
  currentUnitWeek: number | null;

  assessmentEnabled: boolean;
  overseerImageId: number = null; // image needs to be lazy loadaed
  private _overseerImage: OverseerImage;

  autoApplyExtensionBeforeDeadline: boolean;
  sendNotifications: boolean;
  enableSyncEnrolments: boolean;
  enableSyncTimetable: boolean;

  draftTaskDefinition: TaskDefinition;

  allowStudentExtensionRequests: boolean;
  allowFlexibleDates: boolean = false;
  extensionWeeksOnResubmitRequest: number;
  allowStudentChangeTutorial: boolean;
  markLateSubmissionsAsAssessInPortfolio: boolean;
  enforceFeedbackBeforeDiscussedInClass: boolean;

  feedbackWarningThresholdDays: number;
  feedbackOverflowThresholdDays: number;
  gradeDefinitions: GradeDefinition[] = [
    {id: 'fail', value: -1, label: 'Fail', abbreviation: 'F'},
    {id: 'pass', value: 0, label: 'Pass', abbreviation: 'P'},
    {id: 'credit', value: 1, label: 'Credit', abbreviation: 'C'},
    {id: 'distinction', value: 2, label: 'Distinction', abbreviation: 'D'},
    {id: 'high-distinction', value: 3, label: 'High Distinction', abbreviation: 'HD'},
  ];

  d2lMapping: D2lAssessmentMapping;

  public readonly learningOutcomesCache: EntityCache<LearningOutcome> =
    new EntityCache<LearningOutcome>();
  public readonly tutorialStreamsCache: EntityCache<TutorialStream> =
    new EntityCache<TutorialStream>();
  public readonly tutorialsCache: EntityCache<Tutorial> = new EntityCache<Tutorial>();
  // readonly tutorialEnrolments: EntityCache<TutorialEnrolment>;
  public readonly taskDefinitionCache: EntityCache<TaskDefinition> =
    new EntityCache<TaskDefinition>();
  public readonly taskOutcomeAlignmentsCache: EntityCache<TaskOutcomeAlignment> =
    new EntityCache<TaskOutcomeAlignment>();

  readonly staffCache: EntityCache<UnitRole> = new EntityCache<UnitRole>();

  public readonly groupSetsCache: EntityCache<GroupSet> = new EntityCache<GroupSet>();

  groupMemberships: GroupMembership[];

  readonly studentCache: EntityCache<Project> = new EntityCache<Project>();

  public override toJson<T extends Entity>(
    mappingData: EntityMapping<T>,
    ignoreKeys?: string[],
  ): object {
    return {
      unit: super.toJson(mappingData, ignoreKeys),
    };
  }

  public hasChanges(): boolean {
    const unitService = AppInjector.get(UnitService);
    const changes = this.toJson(unitService.mapping);
    return JSON.stringify(changes) !== '{"unit":{}}';
  }

  public get nameAndPeriod(): string {
    return `${this.name} (${
      this.teachingPeriod ? this.teachingPeriod.name : this.startDate.toLocaleDateString()
    })`;
  }

  public get codeAndPeriod(): string {
    return `${this.code} (${
      this.teachingPeriod ? this.teachingPeriod.name : this.startDate.toLocaleDateString()
    })`;
  }

  public get isActive(): boolean {
    return this.active && (!this.teachingPeriod || this.teachingPeriod.active);
  }

  public get gradeValues(): number[] {
    return this.gradeDefinitions
      .filter((definition) => definition.value >= 0)
      .map((definition) => definition.value);
  }

  public gradeLabel(value: number): string {
    return this.gradeDefinitions.find((definition) => definition.value === value)?.label;
  }

  public gradeAbbreviation(value: number): string {
    return this.gradeDefinitions.find((definition) => definition.value === value)?.abbreviation;
  }

  public matches(text: string): boolean {
    return this.code.toLowerCase().indexOf(text) >= 0 || this.name.toLowerCase().indexOf(text) >= 0;
  }

  public addStaff(user: User, role: 'Tutor' | 'Convenor' = 'Tutor'): Observable<UnitRole> {
    const unitRoleService = AppInjector.get(UnitRoleService);
    return unitRoleService.create(
      {
        unit_id: this.id,
        user_id: user.id,
        role: role,
      },
      {
        cache: this.staffCache,
      },
    );
  }

  public changeMainConvenor(unitRole: UnitRole): Observable<Unit> {
    const unitService = AppInjector.get(UnitService);
    const oldConvenor = this.mainConvenor;
    this.mainConvenor = unitRole;
    return unitService.update(this).pipe(tap({error: () => (this.mainConvenor = oldConvenor)}));
  }

  public get staff(): readonly UnitRole[] {
    return this.staffCache.currentValues;
  }

  public get staffUsers(): readonly User[] {
    return this.staffCache.currentValues.map((ur) => ur.user);
  }

  public findStudent(id: number): Project {
    return this.students.find((s) => s.id === id);
  }

  public studentEnrolled(id: number): boolean {
    return this.findStudent(id)?.enrolled;
  }

  /**
   * Enrol a student within the unit.
   *
   * @param idOrEmail The student id or email of the student to enrol.
   * @param campus The student's campus
   * @returns an observer of the post with the student project.
   */
  public enrolStudent(idOrEmail: string, campus: Campus): Observable<Project> {
    const projectService = AppInjector.get(ProjectService);

    return projectService.create(
      {
        unit_id: this.id,
        student_num: idOrEmail,
        campus_id: campus.id,
      },
      {
        cache: this.studentCache,
      },
    );
  }

  public get currentUserIsStaff(): boolean {
    return this.myRole !== 'Student';
  }

  public get currentUserCanViewUnitAdmin(): boolean {
    return this.myRole === 'Convenor' || this.myRole === 'Admin' || this.myRole === 'Auditor';
  }

  public get taskDefinitions(): readonly TaskDefinition[] {
    return this.taskDefinitionCache.currentValues;
  }

  public taskDefinitionsForGrade(grade: number): TaskDefinition[] {
    return this.taskDefinitions.filter((td) => td.targetGrade <= grade);
  }

  public deleteTaskDefinition(taskDef: TaskDefinition) {
    const taskDefinitionService = AppInjector.get(TaskDefinitionService);
    const alerts = AppInjector.get(AlertService);

    taskDefinitionService
      .delete({unitId: this.id, id: taskDef.id}, {cache: this.taskDefinitionCache, entity: taskDef})
      .subscribe({
        next: () => {
          alerts.success('Task Deleted', 2000);
        },
        error: (message) => alerts.error(message, 6000),
      });
  }

  public taskCount(): number {
    return this.taskDefinitionCache.size;
  }

  public get tutorialStreams(): readonly TutorialStream[] {
    return this.tutorialStreamsCache.currentValues;
  }

  public get tutorials(): readonly Tutorial[] {
    return this.tutorialsCache.currentValues;
  }

  public get ilos(): readonly LearningOutcome[] {
    return this.learningOutcomesCache.currentValues;
  }

  public get taskDefinitionCount(): number {
    return this.taskDefinitionCache.size;
  }

  /**
   * Get a stream from the unit by abbreviation
   * @param abbr the abbreviation of the stream
   * @returns the stream object or null
   */
  public tutorialStreamForAbbr(abbr: string): TutorialStream {
    if (abbr) {
      return this.tutorialStreams.find((ts) => ts.abbreviation === abbr);
    } else {
      return null;
    }
  }

  /**
   * Get the total duration of the unit in milliseconds.
   */
  public get totalDuration(): number {
    return this.endDate.valueOf() - this.startDate.valueOf();
  }

  /**
   * Get the number of weeks in the unit's teaching period.
   */
  public get totalWeeks(): number {
    return Math.ceil(this.totalDuration / (1000 * 60 * 60 * 24 * 7));
  }

  /**
   * Calculate the teaching week number for a given date.
   * Mirrors the Rails fallback in Unit#week_number when a teaching period
   * helper is not being used on the frontend.
   */
  public weekNumber(date: Date | string): number | null {
    if (!date || !this.startDate) {
      return null;
    }

    if (this.teachingPeriod) {
      return this.teachingPeriod.weekNumber(date);
    }

    const targetDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(targetDate.valueOf())) {
      return null;
    }
    const normalizedTargetDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );
    const normalizedStartDate = new Date(
      this.startDate.getFullYear(),
      this.startDate.getMonth(),
      this.startDate.getDate(),
    );
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return (
      Math.floor(
        (normalizedTargetDate.valueOf() - normalizedStartDate.valueOf()) / millisecondsPerWeek,
      ) + 1
    );
  }

  /**
   * Calculate how much time has elapsed in the teaching period, based on the start and
   * end date of the unit relative to the current date.
   *
   * @returns the percentage of the teaching period that has elapsed
   */
  public get teachingPeriodProgress() {
    const today = new Date();

    //use Math.abs to avoid sign
    if (today <= this.startDate) {
      return 0;
    }
    if (today >= this.endDate) {
      return 100;
    }

    const startToNow = Math.abs(today.valueOf() - this.startDate.valueOf());
    const totalDuration = Math.abs(this.totalDuration);
    return Math.round((startToNow / totalDuration) * 100);
  }

  public rolloverTo(
    body:
      | {new_unit_code?: string; start_date: Date; end_date: Date}
      | {new_unit_code?: string; teaching_period_id: number},
  ): Observable<Unit> {
    const unitService = AppInjector.get(UnitService);

    return unitService.create(
      {
        id: this.id,
      },
      {
        endpointFormat: unitService.rolloverEndpoint,
        body: body,
      },
    );
  }

  public get students(): readonly Project[] {
    return this.studentCache.currentValues;
  }

  public get activeStudents(): readonly Project[] {
    return this.studentCache.currentValues.filter((p) => p.enrolled);
  }

  public tutorialsForUserName(userName: string): Tutorial[] {
    return this.tutorials.filter((tutorial) => tutorial.tutorName === userName);
  }

  public incorporateTasks(tasks: Task[]): void {
    tasks.forEach((t) => {
      const project = this.findStudent(t.project.id);
      if (project) {
        project.incorporateTask(t);
      }
    });
  }

  public fillWithUnStartedTasks(tasks: Task[], taskDef: TaskDefinition | number): Task[] {
    // Make sure the task definition is a task definition object from the unit
    const td = taskDef instanceof TaskDefinition ? taskDef : this.taskDef(taskDef);

    // Now fill for the students in the unit
    return this.students.map((p) => {
      // See if we already have the task
      let t = tasks.find((t) => t.project.id === p.id && t.definition.id === td.id);
      if (!t) {
        // No task in array, find task in project
        t = p.tasks.find((t) => t.definition.id == td.id);
      }

      if (!t) {
        t = new Task(p);
        t.definition = td;
        t.status = 'not_started';
      }

      return t;
    });
  }

  public refresh(): void {
    const alerts = AppInjector.get(AlertService);
    AppInjector.get(UnitService)
      .fetch(this.id)
      .subscribe({
        next: (unit) => {
          console.log(unit.teachingPeriod?.name);
        },
        error: (message) => alerts.error(message, 6000),
      });
  }

  public setupTasksForStudent(project: Project) {
    // create not started tasks...
    this.taskDefinitions.forEach((taskDefinition) => {
      if (!project.findTaskForDefinition(taskDefinition.id)) {
        const task = new Task(project);
        task.definition = taskDefinition;
        // add to cache using task definition abbreviation as key - as it has no id
        project.taskCache.set(taskDefinition.abbreviation.toString(), task);
      }
    });
  }

  public tutorialFromId(tutorialId: number): Tutorial {
    return this.tutorialsCache.get(tutorialId);
  }

  public hasGroupwork(): boolean {
    return this.groupSetsCache.size > 0;
  }

  public refreshGroups(): void {
    // return unless unit.groups?.length > 0
    // # Query the groups within the unit.
    // Unit.groups.query( {id: unit.id} ,
    //   (success) ->
    //     # Save the result as the unit's groups
    //     unit.groups = success
    //   (failure) ->
    //     alertService.error( "Error refreshing unit groups: " + (failure.data?.error || "Unknown cause"), 6000)
    // )

    console.log('implement refresh groups');
  }

  public getGroups(groupSet: GroupSet): Observable<Group[]> {
    const groupService: GroupService = AppInjector.get(GroupService);

    return groupService.query(
      {
        unitId: this.id,
        groupSetId: groupSet.id,
      },
      {
        cache: groupSet.groupsCache,
        constructorParams: this,
      },
    );
  }

  public findGroupSet(id: number): GroupSet {
    return this.groupSetsCache.get(id);
  }

  public taskDef(taskDefId: number): TaskDefinition {
    return this.taskDefinitionCache.get(taskDefId);
  }

  public get taskOutcomeAlignments(): readonly TaskOutcomeAlignment[] {
    return this.taskOutcomeAlignmentsCache.currentValues;
  }

  public staffAlignmentsForTaskDefinition(td: TaskDefinition): TaskOutcomeAlignment[] {
    return this.taskOutcomeAlignments
      .filter((alignment: TaskOutcomeAlignment) => {
        return alignment.taskDefinition.id === td.id;
      })
      .sort((a: TaskOutcomeAlignment, b: TaskOutcomeAlignment) => {
        return a.learningOutcome.id - b.learningOutcome.id;
      });
  }

  public get taskAlignmentCSVUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${
      this.id
    }/learning_alignments/csv.json`;
  }

  public get gradesCSVUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.id}/grades/csv`;
  }

  public taskStatusFactor(_td: TaskDefinition): number {
    return 1;
  }

  public getOutcomeBatchUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.id}/outcomes/csv`;
  }

  public getFeedbackTemplateBatchUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.id}/feedback_chips/csv`;
  }

  public hasStreams(): boolean {
    return this.tutorialStreamsCache.size > 1;
  }

  public nextStream(activityTypeAbbreviation: string): Observable<TutorialStream> {
    const tutorialStreamService = AppInjector.get(TutorialStreamService);

    return tutorialStreamService.create(
      {unit_id: this.id, activity_type_abbr: activityTypeAbbreviation, abbreviation: undefined},
      {cache: this.tutorialStreamsCache},
    );
  }

  public deleteStream(stream: TutorialStream): Observable<boolean> {
    const tutorialStreamService = AppInjector.get(TutorialStreamService);

    return tutorialStreamService
      .delete<boolean>(
        {unit_id: this.id, abbreviation: stream.abbreviation},
        {cache: this.tutorialStreamsCache},
      )
      .pipe(
        tap((response: boolean) => {
          if (response) {
            const tutorials = this.tutorialsCache.currentValues;
            tutorials.forEach((t) => {
              if (t.tutorialStream === stream) {
                this.tutorialsCache.delete(t);
              }
            });
          }
        }),
      );
  }

  public refreshStudents(includeWithdrawnStudents: boolean = false) {
    const projectService: ProjectService = AppInjector.get(ProjectService);
    projectService.loadStudents(this, includeWithdrawnStudents, true);
  }

  public findProjectForUsername(username: string): Project {
    return this.students.find((s) => s.student.username === username);
  }

  public get groupSets(): readonly GroupSet[] {
    return this.groupSetsCache.currentValues;
  }

  public set overseerImage(image: OverseerImage) {
    this._overseerImage = image;
    this.overseerImageId = image.id;
  }

  public get overseerImage(): OverseerImage {
    return this._overseerImage;
  }

  public get overseerEnabled(): boolean {
    return this.assessmentEnabled && AppInjector.get(DoubtfireConstants).IsOverseerEnabled.value; // && this.overseerImageId !== null && this.overseerImageId !== undefined;
  }

  private addStudentTypeAheadData(students: readonly Project[], appendTo: string[]): void {
    students.forEach((project) => {
      appendTo.push(project.student.name);
      appendTo.push(project.student.username);
    });
  }

  public get studentFilterTypeAheadData(): string[] {
    const result: string[] = [];

    this.tutorials.forEach((tute) => {
      result.push(tute.abbreviation);
      if (!result.includes(tute.tutorName)) {
        result.push(tute.tutorName);
      }
    });

    this.addStudentTypeAheadData(this.students, result);

    return result;
  }

  public studentsForGroupTypeAhead(group: Group): Project[] {
    const gs = group.groupSet;
    const members = group.projectsCache;
    let result: Project[];

    if (gs.keepGroupsInSameClass) {
      result = this.activeStudents.filter(
        (student) => student.isEnrolledIn(group.tutorial) && !members.has(student.id),
      );
    } else {
      result = this.activeStudents.filter((student) => !members.has(student.id));
    }

    return result;
  }

  public outcome(id: number): LearningOutcome {
    return this.learningOutcomesCache.get(id);
  }

  public get gradesUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.id}/grades`;
  }

  public get portfoliosUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/submission/unit/${this.id}/portfolio`;
  }

  public get taskUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${
      this.id
    }/task_definitions/task_pdfs`;
  }

  /**
   * Download all of the task definitions in a csv
   */
  public downloadTaskDefinitionsCsv(): void {
    AppInjector.get(FileDownloaderService).downloadFile(
      this.getTaskDefinitionBatchUploadUrl(),
      `${this.name}-all-task-definitions.csv`,
    );
  }

  /**
   * Download all of the task resources in a zip.
   */
  public downloadAllTaskResourcesZip(): void {
    AppInjector.get(FileDownloaderService).downloadFile(
      `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.id}/all_resources`,
      `${this.name}-all-task-resources.zip`,
    );
  }

  public get enrolStudentsCSVUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}`;
  }

  public get withdrawStudentsCSVUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/withdraw`;
  }

  public getTaskMarkingUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/submission/assess.json?unit_id=${
      this.id
    }`;
  }

  public getBatchFeedbackUploadUrl(taskDefinition: TaskDefinition | number): string {
    const params = new URLSearchParams({unit_id: `${this.id}`});
    const taskDefinitionId =
      taskDefinition instanceof TaskDefinition ? taskDefinition.id : taskDefinition;

    params.set('task_definition_id', `${taskDefinitionId}`);

    return `${AppInjector.get(DoubtfireConstants).API_URL}/submission/batch_feedback_csv.json?${params.toString()}`;
  }

  public getTaskDefinitionBatchUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/csv/task_definitions?unit_id=${this.id}`;
  }

  public downloadTaskCompletionCsv(): Observable<SidekiqJob> {
    return AppInjector.get(HttpClient).get<SidekiqJob>(
      `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/task_completion`,
    );
  }

  public downloadTasksAwaitingFeedbackCsv(): Observable<SidekiqJob> {
    return AppInjector.get(HttpClient).get<SidekiqJob>(
      `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/tasks_awaiting_feedback`,
    );
  }

  public downloadTaskAssessmentCountsCsv(): Observable<SidekiqJob> {
    return AppInjector.get(HttpClient).get<SidekiqJob>(
      `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/task_assessment_counts`,
    );
  }

  public downloadOverflowTaskClaimsCsv(): Observable<SidekiqJob> {
    return AppInjector.get(HttpClient).get<SidekiqJob>(
      `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/overflow_task_claims`,
    );
  }

  public downloadTutorAssessmentCsv(): Observable<SidekiqJob> {
    return AppInjector.get(HttpClient).get<SidekiqJob>(
      `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/tutor_assessments`,
    );
  }

  public getUserMarkingSessions(
    startDate?: Date,
    endDate?: Date,
    timezone?: string,
  ): Observable<MarkingSession[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set(
        'start_date',
        `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`,
      );
    }

    if (endDate) {
      params = params.set(
        'end_date',
        `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`,
      );
    }

    params = params.set('timezone', timezone);

    // TODO: we should cache the data by the same start/end date
    const markingSessionService = AppInjector.get(MarkingSessionService);
    return markingSessionService.fetchAll(
      {
        unitId: this.id,
      },
      {params, constructorParams: this},
    );
  }

  public downloadTutorTimesSummaryCsv(
    startDate?: Date,
    endDate?: Date,
    timezone?: string,
    ignoreSessionsDuringTutorials?: boolean,
  ): Observable<SidekiqJob> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set(
        'start_date',
        `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`,
      );
    }

    if (endDate) {
      params = params.set(
        'end_date',
        `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`,
      );
    }

    params = params.set('timezone', timezone);

    params = params.set('ignore_sessions_during_tutorials', ignoreSessionsDuringTutorials ?? false);

    return AppInjector.get(HttpClient).get<SidekiqJob>(
      `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/tutor_times_summary`,
      {params},
    );
  }

  public downloadMyTutorTimeSessionsCsv(
    startDate?: Date,
    endDate?: Date,
    timezone?: string,
  ): Observable<SidekiqJob> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set(
        'start_date',
        `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`,
      );
    }

    if (endDate) {
      params = params.set(
        'end_date',
        `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`,
      );
    }

    params = params.set('timezone', timezone);

    return AppInjector.get(HttpClient).get<SidekiqJob>(
      `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/my_marking_sessions`,
      {params},
    );
  }

  public hasD2lMapping(): boolean {
    const doubtfireConstants = AppInjector.get(DoubtfireConstants);
    return (
      doubtfireConstants.IsD2LEnabled.value &&
      this.d2lMapping !== undefined &&
      this.d2lMapping.orgUnitId !== undefined &&
      this.d2lMapping.orgUnitId.length > 0
    );
  }

  public loadD2lMapping(): Observable<D2lAssessmentMapping> {
    const d2lMappingSvc = AppInjector.get(D2lAssessmentMappingService);

    return d2lMappingSvc.get({unitId: this.id}).pipe(
      tap((mappings) => {
        this.d2lMapping = mappings;
      }),
    );
  }

  public get staffNotesCsvDownloadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/staff_notes`;
  }

  public downloadStaffNotesCsv(): void {
    AppInjector.get(FileDownloaderService).downloadFile(
      `${AppInjector.get(DoubtfireConstants).API_URL}/csv/units/${this.id}/staff_notes`,
      `${this.name}-StaffNotes.csv`,
    );
  }

  public get taskDefinitionsPrerequisitesUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.id}/task_prerequisites`;
  }

  public getTaskPrerequisites(): Observable<TaskPrerequisite[]> {
    const prerequisiteService = AppInjector.get(TaskPrerequisiteService);
    return prerequisiteService.getUnitPrerequisites(this.id);
  }
}
