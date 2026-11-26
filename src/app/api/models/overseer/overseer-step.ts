import {Entity, EntityMapping} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {OverseerStepService} from '../../services/overseer-step.service';
import {TaskDefinition} from '../task-definition';
import {TaskStatusEnum} from '../task-status';

export class OverseerStep extends Entity {
  id: number;
  taskDefinition: TaskDefinition;

  name: string;
  description: string;

  // Shown to the student's
  displayName: string;
  displayDescription: string;

  runCommand: string;
  decodedRunCommand: string;

  commandLanguage: string;
  timeout: number;
  sortOrder: number;
  stepType: 'status_check' | 'output_diff';
  partialOutputDiff: boolean;
  stdinInputFile: string;
  expectedOutputFile: string;

  feedbackMessage: string;
  statusOnSuccess: TaskStatusEnum | 'no_change';
  statusOnFailure: TaskStatusEnum | 'no_change';

  haltOnSuccess: boolean;
  haltOnFailure: boolean;

  showExpectedOutput: boolean;
  showStdin: boolean;
  showStdout: boolean;

  enabled: boolean;

  // showStdOutToStudent: boolean

  constructor(td?: TaskDefinition) {
    super();
    this.taskDefinition = td;
  }

  public override toJson<T extends Entity>(
    mappingData: EntityMapping<T>,
    ignoreKeys?: string[],
  ): object {
    return {
      overseer_step: super.toJson(mappingData, ignoreKeys),
    };
  }

  public delete() {
    const overseerStepService: OverseerStepService = AppInjector.get(OverseerStepService);
    overseerStepService
      .delete(
        {
          id: this.id,
        },
        {cache: this.taskDefinition.overseerStepsCache, endpointFormat: 'overseer_steps/:id:'},
      )
      .subscribe({
        next: (_response: object) => {
          AppInjector.get(AlertService).success('Successfully deleted overseer step', 4000);
        },
        error: (error) => {
          AppInjector.get(AlertService).error(error?.message || error || 'Unknown error', 2000);
        },
      });
  }
}
