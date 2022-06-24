import { Entity, EntityCache } from 'ngx-entity-service';
import { Observable } from 'rxjs';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { AppInjector } from 'src/app/app-injector';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { Campus, Grade, Group, GroupSet, ProjectService, Task, TaskStatusEnum, Tutorial, TutorialService, TutorialStream, Unit, User } from './doubtfire-model';
import { TaskOutcomeAlignment } from './task-outcome-alignment';


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
  public portfolioFiles: {kind: string, name: string, idx: number}[];

  public taskStats: {
    key: TaskStatusEnum,
    value: number
  }[];
  public orderScale: number;

  public burndownChartData: {key: string, values: number[]}[];
  public readonly taskCache: EntityCache<Task> = new EntityCache<Task>();
  public readonly tutorialEnrolmentsCache: EntityCache<Tutorial> = new EntityCache<Tutorial>();
  public readonly groupCache: EntityCache<Group> = new EntityCache<Group>();
  public readonly taskOutcomeAlignmentsCache: EntityCache<TaskOutcomeAlignment> = new EntityCache<TaskOutcomeAlignment>();

  public grade: number;
  public gradeRationale: string;

  public constructor(unit?: Unit) {
    super();
    this.unit = unit;
  }

  public get myRole(): string {
    return this.unit.myRole;
  }

  public matches(text: string): boolean {
    return this.student.matches(text) ||
      this.campus.matches(text) ||
      this.matchesTutorialEnrolments(text) ||
      this.matchesGroup(text);
  }

  public matchesTutorialEnrolments(matchText): boolean {
    return this.tutorials.filter(
      (enrol) =>
        enrol.abbreviation.toLowerCase().indexOf(matchText) >= 0 ||
        enrol.tutorName.toLowerCase().indexOf(matchText) >= 0
      ).length > 0
  }

  // Search through the student's groups for a match
  public matchesGroup(matchText: string): boolean {
    return this.groups.find(grp => grp.name.toLowerCase().indexOf(matchText) >= 0) !== undefined;
  }

  public groupForGroupSet(gs: GroupSet) {
    return this.groups.find(grp => gs === grp.groupSet);
  }

  public inGroup(grp): boolean {
    return grp && (this.groupCache.get(grp.id)?.id === grp.id);
  }


  public incorporateTask(task: Task) {
    const taskInCache = this.findTaskForDefinition(task.definition.id);

    if ( taskInCache ) {
      // Update the cache object
      Object.assign(taskInCache, task);
      // Make sure it has the right key in the cache
      this.taskCache.add(taskInCache);
    } else {
      this.taskCache.add(task);
    }
  }

  public get tasks(): Task[] {
    return this.taskCache.currentValues;
  }

  public get tutorials(): Tutorial[] {
    return this.tutorialEnrolmentsCache.currentValues;
  }

  public shortTutorialDescription(): string {
    const tutorials = this.tutorials;
    if (tutorials.length > 0) {
      return tutorials.map( tute => tute.abbreviation ).join(",");
    } else {
      return "None";
    }
  }

  public tutorNames(): string {
    return this.tutorials.map(tute => {
      return tute.tutorName;
    }).filter((value, index, self) => self.indexOf(value) === index).join(' ');
  }

  public tutorialForStream(stream: TutorialStream): Tutorial {
    return this.tutorials.find((tute) => tute.tutorialStream === stream || !tute.tutorialStream);
  }

  public get taskOutcomeAlignments(): TaskOutcomeAlignment[] {
    return this.taskOutcomeAlignmentsCache.currentValues;
  }

  public get targetGradeWord(): string {
    return Grade.GRADES[this.targetGrade];
  }

  public activeTasks(): Task[] {
    return this.taskCache.currentValues.filter(task => task.definition.targetGrade <= this.targetGrade);
  }

  public calcTopTasks() {
    // We will assign current weight to tasks...
    var currentWeight: number = 0;

    // Assign weights to tasks in final state - complete, fail, etc
    const sortedCompletedTasks: Task[] =
      this.taskCache.currentValues.
        filter((task) => task.inFinalState()).
        sort( (a, b) =>  a.definition.seq - b.definition.seq).
        sort( (a, b) =>  a.definition.startDate.getTime() - b.definition.startDate.getTime());

    sortedCompletedTasks.forEach((task) => {
      task.topWeight = currentWeight;
      currentWeight++
    });

    // Sort valid top tasks by start date - tasks in non-final state
    const sortedTasks: Task[]  =
      this.taskCache.currentValues.
        filter((task) => task.isValidTopTask()).
        sort( (a, b) =>  a.definition.seq - b.definition.seq).
        sort( (a, b) =>  a.definition.startDate.getTime() - b.definition.startDate.getTime());

    const overdueTasks: Task[] =
      sortedTasks.filter((task) => task.daysUntilDueDate() <= 7);

    // Step 2: select tasks not complete that are overdue. Pass tasks are done first.
    Grade.PASS_RANGE.forEach((grade) => {
      // Sorting needs to be done here according to the days past the target date.
      const closeGradeTasks: Task[] = overdueTasks.
        filter((task) => task.definition.targetGrade === grade).
        sort( (a, b) =>  b.daysPastDueDate() - a.daysPastDueDate());

      closeGradeTasks.forEach((task) => {
        task.topWeight = currentWeight;
        currentWeight++
      });
    });

  // Step 3: ... up to date, so look forward
  const toAdd: Task[] = sortedTasks.
    filter((task) => task.daysUntilDueDate() > 7).
    sort( (a, b) =>  a.definition.targetGrade - b.definition.targetGrade).
    sort( (a, b) =>  a.definition.startDate.getTime() - b.definition.startDate.getTime());

    // Sort by the targetGrade. Pass task are done first if same due date as others.

    toAdd.forEach((task) => {
      task.topWeight = currentWeight;
      currentWeight++
    });
  }

  // Assigns a grade to a student
  public assignGrade(score: number, rationale: string): void {
    const alerts: any = AppInjector.get(alertService);
    const projectService: ProjectService = AppInjector.get(ProjectService);
    const oldGrade: number = this.grade;
    this.grade = score;
    this.gradeRationale = rationale;

    projectService.update(this, {
      body: {
        grade: score,
        old_grade: oldGrade,
        grade_rationale: rationale
      }
    }).subscribe({
      next: (project) => {
        alerts.add("success", "Grade updated.", 2000);
      },
      error: (message) => {
        alerts.add("danger", `Grade was not updated: ${message}`, 8000);
      }
    });
  }

  //# Get the status of the portfolio
  public portfolioTaskStatus(): string {
    if(this.portfolioAvailable)
      return "complete";
    else if (this.compilePortfolio)
      return "working_on_it";
    else
      return "not_started";
  }

  public portfolioTaskStatusClass(): string {
    return this.portfolioTaskStatus().replace(/_/g, '-');
  }

  public portfolioUrl(asAttachment: boolean = false): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/submission/project/${this.id}/portfolio${asAttachment ? "?as_attachment=true" : ""}`;
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
    console.log("implement updateBurndownChart");
  }

  public get groups(): Group[] {
    return this.groupCache.currentValues;
  }

  public getGroupForTask(task: Task): Group {
    if ( ! task.definition.isGroupTask() ) {
      return null;
    } else {
      this.groups.find( group => group.groupSet.id === task.definition.groupSet.id ) ||
        this.unit.groups.find(group => group.groupSet.id === task.definition.groupSet.id && group.projects.includes(this));
    }
  }

  public isEnrolledIn(tutorial: Tutorial): boolean {
    return this.tutorials.includes(tutorial);
  }

  public updateUnitEnrolment(): void {
    const expected = this.enrolled = !this.enrolled;
    const alerts: any = AppInjector.get(alertService);
    const projectService: ProjectService = AppInjector.get(ProjectService);
    projectService.update(this).subscribe({
      next: (project) => {
        if (expected == project.enrolled) {
          alerts.add('success', 'Enrolment changed.', 2000);
        } else {
          alerts.add('danger', 'Enrolment change failed.', 5000);
        }
      },
      error: (message) => {
        alerts.add('danger', message, 5000)
      }
    });
  }

  public hasTutor(tutor: User) {
    return this.tutorials.find(tute => tute.tutor === tutor) !== undefined;
  }

  public switchToTutorial(tutorial: Tutorial) {
    // newId = if tutorial? then (if _.isString(tutorial) || _.isNumber(tutorial) then +tutorial else tutorial?.id) else -1
    const tutorialService: TutorialService = AppInjector.get(TutorialService);
    tutorialService.switchTutorial(this, tutorial, !this.isEnrolledIn(tutorial));
  }

}
