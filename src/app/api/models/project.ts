import { Entity, EntityCache } from 'ngx-entity-service';
import { AppInjector } from 'src/app/app-injector';
import { Campus, Grade, Group, Task, Tutorial, TutorialService, TutorialStream, Unit, User } from './doubtfire-model';
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

  public portfolioFiles: {kind: string, name: string, idx: number}[];

  public taskStats: {
    red_pct: number,
    grey_pct: number,
    orange_pct: number,
    blue_pct: number,
    green_pct: number,
    order_scale: number
  };

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
  public matchesGroup(matchText): boolean {
    return this.groups.find(grp => grp.name.toLowerCase().indexOf(matchText) >= 0) !== undefined;
  }


  public get tasks(): Task[] {
    return this.taskCache.currentValues;
  }

  public get tutorials(): Tutorial[] {
    return this.tutorialEnrolmentsCache.currentValues;
  }

  public shortTutorialDescription() {
    const tutorials = this.tutorials;
    if (tutorials.length > 0) {
      return tutorials.map( tute => tute.abbreviation ).join(",");
    } else {
      return "None";
    }
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

  public numberTasks(status: string) {
    return this.taskCache.currentValues.filter((task) => task.status === status).length;
  }

  public findTaskForDefinition(id: number): Task {
    return this.taskCache.currentValues.find((task) => task.definition.id === id);
  }

  switchToCampus(value: any, originalCampusId: number, arg2: () => void) {
    console.log("implement switch campus");
    // throw new Error('Method not implemented.');
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

  public switchToTutorial(tutorial: Tutorial) {
    // newId = if tutorial? then (if _.isString(tutorial) || _.isNumber(tutorial) then +tutorial else tutorial?.id) else -1
    const tutorialService: TutorialService = AppInjector.get(TutorialService);
    tutorialService.switchTutorial(this, tutorial, !this.isEnrolledIn(tutorial));
  }

}
