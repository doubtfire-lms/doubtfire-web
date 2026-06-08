import {Entity, EntityMapping} from 'ngx-entity-service';
import {Observable, tap} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskPrerequisiteService} from '../services/task-prerequisite.service';
import {Project, TaskDefinition, TaskStatus, TaskStatusEnum} from './doubtfire-model';

export interface TaskPrerequisiteData {
  taskDefinitionId: number;
  prerequisiteId: number;
  taskStatus: TaskStatusEnum;
}

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
    assess_in_portfolio: 1,
    discuss: 2,
    attention_required: 0,
    demonstrate: 2,
    complete: 3,
  };

  constructor(json: TaskPrerequisiteData) {
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

  public requiredStatusLabel() {
    return TaskStatus.STATUS_LABELS.get(this.taskStatus);
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

  public delete(): Observable<void> {
    const taskPrerequisiteService: TaskPrerequisiteService =
      AppInjector.get(TaskPrerequisiteService);

    return taskPrerequisiteService
      .delete<void>(
        {
          unitId: this.taskDefinition.unit.id,
          taskDefId: this.taskDefinitionId,
          prerequisiteId: this.prerequisiteId,
        },
        {cache: this.taskDefinition.taskPrerequisitesCache},
      )
      .pipe(
        tap({
          next: () => {
            AppInjector.get(AlertService).error('Successfully deleted prerequisite', 4000);
            this.taskDefinition.taskPrerequisitesCache.delete(this.id);
          },
          error: (error) => {
            AppInjector.get(AlertService).error(error?.message || error || 'Unknown error', 2000);
          },
        }),
      );
  }
}
