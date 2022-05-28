import { Entity } from 'ngx-entity-service';

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

const TASK_KEYS_MAP = {

};

export class Task extends Entity {
  id: number;
  project_id: number;
  task_definition_id: number;
  status: string;
  due_date: Date;
  extensions: number;
  submission_date: Date;
  completion_date: Date;
  times_assessed: number;
  grade: number;
  quality_pts: number;
  include_in_portfolio: boolean;
  pct_similar: number;
  similar_to_count: number;
  similar_to_dismissed_count: number;
  num_new_comments: number;




}
