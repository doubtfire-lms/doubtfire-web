import { Entity } from 'ngx-entity-service';
import { TaskDefinition, Project, Unit } from './doubtfire-model';

export class Task extends Entity {
  id: number;

  status: string;
  dueDate: Date;
  extensions: number;
  submissionDate: Date;
  completionDate: Date;
  timesAssessed: number;
  grade: number;
  qualityPts: number;
  includeInPortfolio: boolean;
  pctSimilar: number;
  similarToCount: number;
  similarToDismissedCount: number;
  numNewComments: number;

  readonly project: Project;
  definition: TaskDefinition;

  constructor(project?: Project) {
    super();
    this.project = project;
  }


}
