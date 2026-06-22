import {Entity, EntityCache, EntityMapping} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Task} from '../doubtfire-model';
import {SubmissionArchive} from '../submission-history';
import {TaskStatusEnum} from '../task-status';
import {OverseerStepResult} from './overseer-step-result';

export class OverseerAssessment extends Entity implements SubmissionArchive {
  id: number;
  // overseerStepId: number;
  timestamp: Date;
  timestampString: string;
  content?: {label: string; result: string}[];
  task?: Task;
  taskStatus?: TaskStatusEnum;
  submissionStatus?: 'queued' | 'executing' | 'passed' | 'failed' | 'error';
  createdAt?: Date;
  updatedAt?: Date;
  taskId?: number;
  submissionHistoryId?: number;

  totalSteps: number;
  passedSteps: number;

  label: string;
  hasSubmissionFiles?: boolean;

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

  public submissionFilesUrl(): string {
    const constants = AppInjector.get(DoubtfireConstants);
    const timestamp =
      this.timestampString ?? Math.floor(this.timestamp.getTime() / 1000).toString();
    return `${constants.API_URL}/projects/${this.task.project.id}/task_def_id/${this.task.definition.id}/submissions/timestamps/${timestamp}/files`;
  }
}
