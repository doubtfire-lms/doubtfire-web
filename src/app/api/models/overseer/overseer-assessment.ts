import {Entity, EntityMapping} from 'ngx-entity-service';
import {Task} from '../doubtfire-model';

export class OverseerAssessment extends Entity {
  id: number;
  timestamp: Date;
  timestampString: string;
  content?: [{label: string; result: string}];
  task?: Task;
  taskStatus?: string;
  submissionStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
  taskId?: number;

  label: string;

  constructor(task?: Task) {
    super();

    if (task) {
      this.task = task;
    }
  }

  public override toJson<T extends Entity>(
    mappingData: EntityMapping<T>,
    ignoreKeys?: string[],
  ): object {
    return {
      overseer_assessment: super.toJson(mappingData, ignoreKeys),
    };
  }
}
