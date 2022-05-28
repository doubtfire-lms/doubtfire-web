import { Entity } from 'ngx-entity-service';
import { Campus, Unit, User } from './doubtfire-model';

const KEYS =
  [
    'id',
    'project_id',
    'task_definition_id',
    'status',
    'due_date',
    'extensions',
    'submission_date',
    'completion_date',
    'times_assessed',
    'grade',
    'quality_pts',
    'include_in_portfolio',
    'pct_similar',
    'similar_to_count',
    'similar_to_dismissed_count',
    'num_new_comments',
  ];


export class Project extends Entity {

  public unit: Unit;
  public campus: Campus;
  public user: User;

  public studentName: string;

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
  // public tasks: ;
  // public tutorialEnrolments: ;
  // public groups: ;
  // public taskOutcomeAlignments: ;

  public grade: number;
  public gradeRationale: string;

}
