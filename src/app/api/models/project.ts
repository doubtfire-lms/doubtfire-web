import { Entity, EntityCache } from 'ngx-entity-service';
import { Campus, Task, Unit, User } from './doubtfire-model';


export class Project extends Entity {

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

  public task_stats: {
    red_pct: number,
    grey_pct: number,
    orange_pct: number,
    blue_pct: number,
    green_pct: number,
    order_scale: number
  };

  public burndownChartData: {key: string, values: number[]}[];
  public readonly tasks: EntityCache<Task> = new EntityCache<Task>();
  // public tutorialEnrolments: ;
  // public groups: ;
  // public taskOutcomeAlignments: ;

  public grade: number;
  public gradeRationale: string;

  public constructor(unit?: Unit) {
    super();
    this.unit = unit;
  }

  public get myRole(): string {
    return this.unit.myRole;
  }

  public activeTasks(): Task[] {
    return this.tasks.currentValues.filter(task => task.definition.targetGrade <= this.targetGrade);
  }
}
