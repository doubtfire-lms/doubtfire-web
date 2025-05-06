import {
  Project,
  Task,
  TaskDefinition,
  TaskStatus,
  TaskStatusEnum,
  TaskStatusUiData,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { CachedEntityService, EntityCache, RequestOptions } from 'ngx-entity-service';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { MappingFunctions } from './mapping-fn';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class TaskService extends CachedEntityService<Task> {
  protected readonly endpointFormat = '/projects/:projectId:/task_def_id/:taskDefId:';

  private readonly taskInboxEndpoint = '/units/:id:/tasks/inbox';
  private readonly taskExplorerEndpoint = '/units/:id:/task_definitions/:task_def_id:/tasks';
  private readonly refreshTaskEndpoint = 'projects/:projectId:/refresh_tasks/:taskDefinitionId:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      {
        keys: 'projectId',
        toEntityOp: (data: object, jsonKey: string, task: Task, _params?: any) => {
          // Is fetching task outside of project...
          task.project = task.unit.findStudent(data[jsonKey]);
        },
      },
      {
        keys: 'taskDefinitionId',
        toEntityOp: (data: object, key: string, entity: Task, _params?: any) => {
          entity.definition = entity.project.unit.taskDef(data['task_definition_id']);
        },
      },
      'status',
      {
        keys: 'dueDate',
        toEntityFn: MappingFunctions.mapDateToEndOfDay,
      },
      'extensions',
      'scormExtensions',
      {
        keys: 'submissionDate',
        toEntityFn: MappingFunctions.mapDateToDay,
      },
      {
        keys: 'completionDate',
        toEntityFn: MappingFunctions.mapDateToDay,
      },
      'timesAssessed',
      'grade',
      'qualityPts',
      'includeInPortfolio',
      'similarityFlag',
      'numNewComments',
      'trigger',
      'hasExtensions',
      'pinned',
      {
        keys: 'new_stat',
        toEntityOp: (data: object, key: string, entity: Task, params?: any) => {
          entity.project.taskStats = data['new_stat'];
        },
      },
      {
        keys: 'otherProjects',
        toEntityOp: (data: object, key: string, entity: Task, params?: any) => {
          data['other_projects'].forEach((details) => {
            const proj = entity.unit.findStudent(details.id);
            if (proj) {
              // Update the other project's task status overview
              const otherTask = proj.findTaskForDefinition(entity.definition.id);
              if (otherTask) {
                otherTask.project.taskStats = details['new_stats'];
                otherTask.grade = data['grade'];
                otherTask.status = data['status'];
              }
            }
          });
        },
      }
    );

    this.mapping.addJsonKey('qualityPts', 'grade', 'includeInPortfolio', 'trigger');
  }

  public createInstanceFrom(json: object, other?: any): Task {
    return new Task(other as Project);
  }

  public queryTasksForTaskInbox(unit: Unit, taskDef?: TaskDefinition | number): Observable<Task[]> {
    const cache: EntityCache<Task> = new EntityCache<Task>();

    return this.query(
      {
        id: unit.id,
      },
      {
        endpointFormat: this.taskInboxEndpoint,
        cache: cache,
        constructorParams: unit,
      }
    ).pipe(
      tap((tasks: Task[]) => {
        unit.incorporateTasks(tasks);
      })
    );
  }

  public queryTasksForTaskExplorer(unit: Unit, taskDef?: TaskDefinition | number): Observable<Task[]> {
    const cache: EntityCache<Task> = new EntityCache<Task>();
    return this.query(
      {
        id: unit.id,
        task_def_id: taskDef instanceof TaskDefinition ? taskDef.id : taskDef,
      },
      {
        endpointFormat: this.taskExplorerEndpoint,
        cache: cache,
        constructorParams: unit,
      }
    ).pipe(
      map((tasks: Task[]) => {
        unit.incorporateTasks(tasks);
        return unit.fillWithUnStartedTasks(tasks, taskDef);
      })
    );
  }

  public refreshExtensionDetails(task: Task): void {
    const pathIds = {
      projectId: task.project.id,
      taskDefinitionId: task.definition.id,
    };
    const options: RequestOptions<Task> = {
      endpointFormat: this.refreshTaskEndpoint,
      cache: task.project.taskCache,
    };

    this.get(pathIds, options).subscribe({
      next: (value: Task) => {},
      error: (message) => {
        console.log(`Failed to refresh tasks ${message}`);
      },
    });
  }

  public readonly statusKeys = TaskStatus.STATUS_KEYS;
  public readonly toBeWorkedOn = TaskStatus.TO_BE_WORKED_ON;
  public readonly discussionStatuses = TaskStatus.DISCUSSION_STATES;
  public readonly gradeableStatuses = TaskStatus.GRADEABLE_STATUSES;
  public readonly stateThatAllowsExtension = TaskStatus.STATE_THAT_ALLOWS_EXTENSION;
  public readonly pdfRegeneratableStatuses = TaskStatus.PDF_REGENERATABLE_STATES;
  public readonly submittableStatuses = TaskStatus.SUBMITTABLE_STATUSES;
  public readonly completeStatus: TaskStatusEnum = 'complete';
  public readonly learningWeight: Map<TaskStatusEnum, number> = TaskStatus.LEARNING_WEIGHT;
  public readonly statusAcronym: Map<TaskStatusEnum, string> = TaskStatus.STATUS_ACRONYM;
  public readonly statusLabels: Map<TaskStatusEnum, string> = TaskStatus.STATUS_LABELS;
  public readonly markedStatuses = TaskStatus.MARKED_STATUSES;
  public readonly statusSeq = TaskStatus.STATUS_SEQ;
  public readonly helpDescriptions = TaskStatus.HELP_DESCRIPTIONS;
  public readonly statusIcons: Map<TaskStatusEnum, string> = TaskStatus.STATUS_ICONS;
  public readonly rejectFutureStates = TaskStatus.REJECT_FUTURE_STATES;

  public statusClass(status: TaskStatusEnum): string {
    return TaskStatus.statusClass(status);
  }

  public readonly statusColors: Map<string, string> = TaskStatus.STATUS_COLORS;
  public readonly switchableStates = TaskStatus.SWITCHABLE_STATES;

  public statusText(status: TaskStatusEnum): string {
    return TaskStatus.STATUS_LABELS.get(status);
  }

  public helpDescription(status: TaskStatusEnum): { detail: string; reason: string; action: string } {
    return TaskStatus.HELP_DESCRIPTIONS.get(status);
  }

  public statusData(data: Task | TaskStatusEnum): TaskStatusUiData {
    return TaskStatus.statusData(data);
  }

  public taskKeyFromString(taskKeyString: string): { studentId: string; taskDefAbbr: string } {
    const taskKeyComponents = taskKeyString?.split('/');
    if (taskKeyComponents) {
      const studentId = taskKeyComponents[0];
      const taskDefAbbr = taskKeyComponents[taskKeyComponents.length - 1];
      return {
        studentId: studentId,
        taskDefAbbr: taskDefAbbr,
      };
    }

    return null;
  }
}
