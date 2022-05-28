import { Entity } from 'ngx-entity-service';
import { User } from '../doubtfire-model';

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


export class GroupSet extends Entity {


}
