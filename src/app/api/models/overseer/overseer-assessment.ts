import {Entity, EntityCache, EntityMapping} from 'ngx-entity-service';
import {Task} from '../doubtfire-model';
import {OverseerStepResult} from './overseer-step-result';

export class OverseerAssessment extends Entity {
  id: number;
  // overseerStepId: number;
  timestamp: Date;
  timestampString: string;
  content?: [{label: string; result: string}];
  task?: Task;
  taskStatus?: string;
  submissionStatus?: 'queued' | 'executing' | 'passed' | 'failed' | 'error';
  createdAt?: Date;
  updatedAt?: Date;
  taskId?: number;

  totalSteps: number;
  passedSteps: number;

  label: string;

  public readonly stepResultsCache: EntityCache<OverseerStepResult> =
    new EntityCache<OverseerStepResult>();

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

  public get stepsSkipped() {
    return this.task?.definition.overseerStepsCache.currentValues.filter(
      (step) =>
        !this.stepResultsCache.currentValues.find((result) => result.overseerStepId === step.id),
    );
  }

  public get reportReady() {
    return this.submissionStatus === 'passed' || this.submissionStatus === 'failed';
  }
}
