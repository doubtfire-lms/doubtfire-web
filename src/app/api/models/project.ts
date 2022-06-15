import { Entity, EntityCache } from 'ngx-entity-service';
import { Campus, Grade, Task, Tutorial, Unit, User } from './doubtfire-model';
import { TaskOutcomeAlignment } from './task-outcome-alignment';
import { TutorialEnrolment } from './tutorial-enrolment';


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
  // public groups: ;
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

  public get tasks(): Task[] {
    return this.taskCache.currentValues;
  }

  public get tutorialEnrolments(): TutorialEnrolment[] {
    return this.tutorialEnrolmentsCache.currentValues;
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

}
