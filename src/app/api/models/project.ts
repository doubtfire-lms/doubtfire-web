import {HttpClient} from '@angular/common/http';
import {Entity, EntityCache, RequestOptions} from 'ngx-entity-service';
import {Observable, tap} from 'rxjs';
import {visualisations} from 'src/app/ajs-upgraded-providers';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {MappingFunctions} from '../services/mapping-fn';
import {
  Campus,
  Grade,
  Group,
  GroupSet,
  ProjectService,
  Task,
  TaskDefinition,
  TaskStatus,
  TaskStatusEnum,
  Tutorial,
  TutorialService,
  TutorialStream,
  Unit,
  User,
} from './doubtfire-model';
import {TaskOutcomeAlignment} from './task-outcome-alignment';
import {AlertService} from 'src/app/common/services/alert.service';

export class Project extends Entity {
  public id: number;
  public unit: Unit;
  public campus: Campus;
  public student: User;

  public targetGrade: number; //TODO: range
  public submittedGrade: number; //TODO: range

  public enrolled: boolean;
  public compilePortfolio: boolean;
  public portfolioAvailable: boolean;
  public usesDraftLearningSummary: boolean;

  public hasPortfolio: boolean;
  public portfolioStatus: number;
  public portfolioFiles: {kind: string; name: string; idx: number}[];

  public taskStats: {
    key: TaskStatusEnum;
    value: number;
  }[];
  public orderScale: number;

  public burndownChartData: {key: string; values: number[]}[];
  public readonly taskCache: EntityCache<Task> = new EntityCache<Task>();
  public readonly tutorialEnrolmentsCache: EntityCache<Tutorial> = new EntityCache<Tutorial>();
  public readonly groupCache: EntityCache<Group> = new EntityCache<Group>();
  public readonly taskOutcomeAlignmentsCache: EntityCache<TaskOutcomeAlignment> =
    new EntityCache<TaskOutcomeAlignment>();

  public grade: number;
  public gradeRationale: string;

  public similarityFlag: boolean = false;

  public constructor(unit?: Unit) {
    super();
    this.unit = unit;
  }

  public get myRole(): string {
    return this.unit.myRole;
  }

  public matches(text: string): boolean {
    return (
      this.student.matches(text) ||
      this.campus?.matches(text) ||
      this.matchesTutorialEnrolments(text) ||
      this.matchesGroup(text)
    );
  }

  public matchesTutorialEnrolments(matchText): boolean {
    return (
      this.tutorials.filter(
        (enrol) =>
          enrol.abbreviation.toLowerCase().indexOf(matchText) >= 0 ||
          enrol.tutorName.toLowerCase().indexOf(matchText) >= 0,
      ).length > 0
    );
  }

  // Search through the student's groups for a match
  public matchesGroup(matchText: string): boolean {
    return this.groups.find((grp) => grp.name.toLowerCase().indexOf(matchText) >= 0) !== undefined;
  }

  public groupForGroupSet(gs: GroupSet) {
    return this.groups.find((grp) => gs === grp.groupSet);
  }

  public inGroup(grp): boolean {
    return grp && this.groupCache.get(grp.id)?.id === grp.id;
  }

  public incorporateTask(task: Task) {
    const taskInCache = this.findTaskForDefinition(task.definition.id);

    if (taskInCache) {
      // Update the cache object
      Object.assign(taskInCache, task);
      // Make sure it has the right key in the cache
      this.taskCache.add(taskInCache);
    } else {
      this.taskCache.add(task);
    }
  }

  public get tasks(): readonly Task[] {
    return this.taskCache.currentValues;
  }

  public tasksByStatus(statusKey: TaskStatusEnum): Task[] {
    const tasksToConsider = this.activeTasks();
    return tasksToConsider.filter((t) => t.status === statusKey);
  }

  public get tutorials(): readonly Tutorial[] {
    return this.tutorialEnrolmentsCache.currentValues;
  }

  public shortTutorialDescription(): string {
    const tutorials = this.tutorials;
    if (tutorials.length > 0) {
      return tutorials.map((tute) => tute.abbreviation).join(',');
    } else {
      return 'None';
    }
  }

  public tutorNames(): string {
    return this.tutorials
      .map((tute) => {
        return tute.tutorName;
      })
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(' ');
  }

  public tutorialForStream(stream: TutorialStream): Tutorial {
    return this.tutorials.find((tute) => tute.tutorialStream === stream || !tute.tutorialStream);
  }

  public get taskOutcomeAlignments(): readonly TaskOutcomeAlignment[] {
    return this.taskOutcomeAlignmentsCache.currentValues;
  }

  public get taskAlignmentCSVUploadUrl(): string {
    return `${this.unit.taskAlignmentCSVUploadUrl}?project_id=${this.id}`;
  }

  public taskStatusFactor(td: TaskDefinition): number {
    const task = this.findTaskForDefinition(td.id);

    return TaskStatus.LEARNING_WEIGHT.get(task?.status);
  }

  public get targetGradeWord(): string {
    return Grade.GRADES[this.targetGrade];
  }

  public get targetGradeAcronym(): string {
    return Grade.GRADE_ACRONYMS.get(this.targetGrade);
  }

  public activeTasks(): Task[] {
    return this.taskCache.currentValues.filter(
      (task) => task.definition.targetGrade <= this.targetGrade,
    );
  }

  public calcTopTasks() {
    // We will assign current weight to tasks...
    var currentWeight: number = 0;

    // Assign weights to tasks in final state - complete, fail, etc
    const sortedCompletedTasks: Task[] = this.taskCache.currentValues
      .filter((task) => task.inFinalState())
      .sort((a, b) => a.definition.seq - b.definition.seq)
      .sort((a, b) => a.definition.startDate.getTime() - b.definition.startDate.getTime());

    sortedCompletedTasks.forEach((task) => {
      task.topWeight = currentWeight;
      currentWeight++;
    });

    // Sort valid top tasks by start date - tasks in non-final state
    const sortedTasks: Task[] = this.taskCache.currentValues
      .filter((task) => task.isValidTopTask())
      .sort((a, b) => a.definition.seq - b.definition.seq)
      .sort((a, b) => a.definition.startDate.getTime() - b.definition.startDate.getTime());

    const overdueTasks: Task[] = sortedTasks.filter((task) => task.daysUntilDueDate() <= 7);

    // Step 2: select tasks not complete that are overdue. Pass tasks are done first.
    Grade.PASS_RANGE.forEach((grade) => {
      // Sorting needs to be done here according to the days past the target date.
      const closeGradeTasks: Task[] = overdueTasks
        .filter((task) => task.definition.targetGrade === grade)
        .sort((a, b) => b.daysPastDueDate() - a.daysPastDueDate());

      closeGradeTasks.forEach((task) => {
        task.topWeight = currentWeight;
        currentWeight++;
      });
    });

    // Step 3: ... up to date, so look forward
    const toAdd: Task[] = sortedTasks
      .filter((task) => task.daysUntilDueDate() > 7)
      .sort((a, b) => a.definition.targetGrade - b.definition.targetGrade)
      .sort((a, b) => a.definition.startDate.getTime() - b.definition.startDate.getTime());

    // Sort by the targetGrade. Pass task are done first if same due date as others.

    toAdd.forEach((task) => {
      task.topWeight = currentWeight;
      currentWeight++;
    });
  }

  // Assigns a grade to a student
  public assignGrade(score: number, rationale: string): void {
    const alerts = AppInjector.get(AlertService);
    const projectService: ProjectService = AppInjector.get(ProjectService);
    const oldGrade: number = this.grade;
    this.grade = score;
    this.gradeRationale = rationale;

    projectService
      .update(this, {
        body: {
          grade: score,
          old_grade: oldGrade,
          grade_rationale: rationale,
        },
      })
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: (project) => {
          alerts.success('Grade updated.');
        },
        error: (message) => {
          this.grade = oldGrade;
          alerts.error(`Grade was not updated: ${message}`);
        },
      });
  }

  //# Get the status of the portfolio
  public portfolioTaskStatus(): string {
    if (this.portfolioAvailable) return 'complete';
    else if (this.compilePortfolio) return 'working_on_it';
    else return 'not_started';
  }

  public portfolioTaskStatusClass(): string {
    return this.portfolioTaskStatus().replace(/_/g, '-');
  }

  public portfolioUrl(asAttachment: boolean = false): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/submission/project/${this.id}/portfolio${
      asAttachment ? '?as_attachment=true' : ''
    }`;
  }

  public deletePortfolio(): Observable<void> {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.delete<void>(this.portfolioUrl(false));
  }

  public deleteFileFromPortfolio(file: {idx: any; kind: any; name: any}) {
    const httpClient = AppInjector.get(HttpClient);
    return httpClient
      .delete<void>(
        `${AppInjector.get(DoubtfireConstants).API_URL}/submission/project/${this.id}/portfolio`,
        {
          body: {
            idx: file.idx,
            kind: file.kind,
            name: file.name,
          },
        },
      )
      .pipe(
        tap(() => {
          this.portfolioFiles = this.portfolioFiles.filter((value) => value != file);
        }),
      );
  }

  public numberTasks(status: string) {
    return this.taskCache.currentValues.filter((task) => task.status === status).length;
  }

  public findTaskForDefinition(id: number): Task {
    return this.taskCache.currentValues.find((task) => task.definition.id === id);
  }

  public switchToCampus(newCampus: Campus): Observable<Project> {
    // return if newId == student.campus_id || newId == -1 && stduent.campus_id == null
    const projectService = AppInjector.get(ProjectService);

    this.campus = newCampus;

    return projectService.update(this);
  }

  public updateBurndownChart() {
    this.refresh();
  }

  public refresh() {
    const projectService: ProjectService = AppInjector.get(ProjectService);
    const options: RequestOptions<Project> = {
      cache: this.unit.studentCache,
    };

    projectService.get(this, options).subscribe((response) => {
      (AppInjector.get(visualisations) as any).refreshAll();
    });
  }

  public get groups(): readonly Group[] {
    return this.groupCache.currentValues;
  }

  public getGroupForTask(task: Task): Group {
    if (!task.definition.isGroupTask()) {
      return null;
    } else {
      const groupSet = task.definition.groupSet;

      return (
        this.groups.find((group) => group.groupSet.id === task.definition.groupSet.id) ||
        groupSet.groups.find((group) => group.projects.includes(this))
      );
    }
  }

  public isEnrolledIn(tutorial: Tutorial): boolean {
    return this.tutorials.includes(tutorial);
  }

  public updateUnitEnrolment(): void {
    const alerts = AppInjector.get(AlertService);
    const projectService: ProjectService = AppInjector.get(ProjectService);
    projectService.update(this).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: (project) => {
        alerts.success('Enrolment changed.', 2000);
      },
      error: (message) => {
        alerts.error(message);
      },
    });
  }

  public hasTutor(tutor: User) {
    return this.tutorials.find((tute) => tute.tutor === tutor) !== undefined;
  }

  public switchToTutorial(tutorial: Tutorial) {
    // newId = if tutorial? then (if _.isString(tutorial) || _.isNumber(tutorial) then +tutorial else tutorial?.id) else -1
    const tutorialService: TutorialService = AppInjector.get(TutorialService);
    tutorialService.switchTutorial(this, tutorial, !this.isEnrolledIn(tutorial));
  }

  public get progressStats() {
    const stats = {};

    this.taskStats.forEach((stat) => {
      stats[stat.key] = stat.value;
    });

    return stats;
  }

  public refreshBurndownChartData(): void {
    const result: {key: string; values: number[]}[] = [];

    // Setup the dictionaries to contain the keys and values
    // key = series name
    // values = array of [ x, y ] values
    const projectedResults = {key: 'Projected', values: []};
    const targetTaskResults = {key: 'Target', values: []};
    const doneTaskResults = {key: 'To Submit', values: []};
    const completeTaskResults = {key: 'To Complete', values: []};

    result.push(targetTaskResults);
    result.push(projectedResults);
    result.push(doneTaskResults);
    result.push(completeTaskResults);

    // Get the weeks between start and end date as an array
    // dates = unit.start_date.to_date.step(unit.end_date.to_date + 1.week, step=7).to_a
    const endDateValue = this.unit.endDate.getTime() + MappingFunctions.weeksMs(3);
    const dates = MappingFunctions.step(
      this.unit.startDate.getTime(),
      endDateValue,
      MappingFunctions.weeksMs(1),
    ).map((val) => new Date(val));

    // Get the target task from the unit's task definitions
    const targetTasks = this.unit.taskDefinitionsForGrade(this.targetGrade);

    // get total value of all tasks assigned to this project
    const total = targetTasks
      .map((td) => td.weighting)
      .reduce((prev, current, idx, array) => prev + current, 0);

    // exit if no tasks or no weights
    if (targetTasks.length === 0 || total === 0) {
      this.burndownChartData = result;
      return;
    }

    const tasks = this.tasks;

    const readyOrCompleteTasks = tasks.filter((task) =>
      ['ready_for_feedback', 'discuss', 'demonstrate', 'complete'].includes(task.status),
    );
    let lastTargetDate: Date;

    const completedTasks = tasks.filter((task) => task.status === 'complete');

    // Get the tasks currently marked as done (or ready to mark)
    const doneTasks = tasks.filter(
      (t) =>
        !['working_on_it', 'not_started', 'fix_and_resubmit', 'redo', 'need_help'].includes(
          t.status,
        ),
    );

    // last done task date)
    if (readyOrCompleteTasks.length === 0) {
      lastTargetDate = this.unit.startDate;
    } else {
      lastTargetDate = readyOrCompleteTasks
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .splice(-1)[0].dueDate;
    }

    // today is used to determine when to stop adding done tasks
    const today =
      new Date().getTime() > this.unit.endDate.getTime() ? this.unit.endDate : new Date();

    // use weekly completion rate to determine projected progress
    let completionRate: number = 0;
    if (readyOrCompleteTasks.length > 0) {
      const weeksElapsed = MappingFunctions.weeksBetween(this.unit.startDate, today);
      if (weeksElapsed > 0) {
        const completedTasksWeight = readyOrCompleteTasks
          .map((t) => t.definition.weighting)
          .reduce((prev, current, idx, arr) => prev + current, 0);
        completionRate = completedTasksWeight / weeksElapsed;
      }
    }

    let projectedRemaining = total;

    // Track which values to add
    let addTarget = true;
    let addProjected = true;
    let addDone = true;

    // Iterate over the dates
    dates.forEach((date) => {
      // get the target values - those from the task definitions
      // amount remaining is the sum of all tasks due after the date
      const targetVal = [
        date.getTime(),
        (targetTasks
          .filter((taskDef) => taskDef.targetDate >= date)
          .map((td) => td.weighting)
          .reduce((prev, current) => prev + current, 0) || 0) / total,
      ];

      // get the done values - those done up to today, or the end of the unit
      const doneVal = [
        date.getTime(),
        (total -
          doneTasks
            .filter((task) => task.submissionDate && task.submissionDate <= date)
            .map((task) => task.definition.weighting)
            .reduce((prev, current) => prev + current, 0)) /
          total,
      ];

      // get the completed values - those signed off
      const completeVal = [
        date.getTime(),
        (total -
          completedTasks
            .filter((task) => task.completionDate <= date)
            .map((task) => task.definition.weighting)
            .reduce((prev, current) => prev + current, 0)) /
          total,
      ];

      // projected value is based on amount done
      const projectedVal = [date.getTime(), projectedRemaining / total];

      // add one week's worth of completion data
      projectedRemaining -= completionRate;

      // add target, done and projected if appropriate
      if (addTarget) {
        targetTaskResults.values.push(targetVal);

        // stop adding the target values once zero target value is reached
        addTarget = targetVal[1] > 0;
      }
      if (addDone) {
        doneTaskResults.values.push(doneVal);
        completeTaskResults.values.push(completeVal);

        // stop adding the done tasks once past date - (add once for tasks done this week, hence after adding)
        addDone = date < today;
      }

      if (addProjected) {
        projectedResults.values.push(projectedVal);
        // stop adding projected values once projected is complete
        addProjected = projectedVal[1] > 0;
      }
    });

    this.burndownChartData = result;
  }
}
