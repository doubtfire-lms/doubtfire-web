import {Entity, EntityMapping} from 'ngx-entity-service';
import {TaskDefinition, TaskStatusEnum} from './doubtfire-model';

export class TaskPrerequisite extends Entity {
  id: number;

  prerequisite: TaskDefinition;
  prerequisiteId: number;
  taskStatusId: number;

  // Minimum required status
  taskStatus: TaskStatusEnum;

  // Parent
  taskDefinition: TaskDefinition;
  taskDefinitionId: number;

  constructor() {
    super();
  }

  public toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      task_prerequisite: super.toJson(mappingData, ignoreKeys),
    };
  }
}
