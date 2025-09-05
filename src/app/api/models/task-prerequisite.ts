import {Entity, EntityMapping} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskPrerequisiteService} from '../services/task-prerequisite.service';
import {Project, TaskDefinition, TaskStatusEnum} from './doubtfire-model';

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

  public readonly STATES: Partial<Record<TaskStatusEnum, number>> = {
    ready_for_feedback: 1,
    discuss: 2,
    demonstrate: 2,
    complete: 3,
  };

  constructor(json: any) {
    super();
    this.taskDefinitionId = json.taskDefinitionId;
    this.prerequisiteId = json.prerequisiteId;
    this.taskStatus = json.taskStatus;
  }

  public toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      task_prerequisite: super.toJson(mappingData, ignoreKeys),
    };
  }

  public hasMetRequiredState(project: Project) {
    if (!this.prerequisite || !project) {
      return false;
    }
    const prerequisiteTask = this.prerequisite.projectTask(project);
    if (!prerequisiteTask) {
      return false;
    }
    const currentStatus = prerequisiteTask.status;
    const requiredStatus = this.taskStatus;
    if (this.STATES[currentStatus] >= this.STATES[requiredStatus]) {
      return true;
    }
    return false;
  }

  public delete() {
    const taskPrerequisiteService: TaskPrerequisiteService =
      AppInjector.get(TaskPrerequisiteService);
    taskPrerequisiteService
      .delete(
        {
          unitId: this.taskDefinition.unit.id,
          taskDefId: this.taskDefinitionId,
          prerequisiteId: this.prerequisiteId,
        },
        {cache: this.taskDefinition.taskPrerequisitesCache},
      )
      .subscribe({
        next: (response: object) => {
          AppInjector.get(AlertService).error('Successfully deleted prerequisite', 4000);
          this.taskDefinition.taskPrerequisitesCache.delete(this.id);
        },
        error: (error: any) => {
          AppInjector.get(AlertService).error(error?.message || error || 'Unknown error', 2000);
        },
      });
  }
}
