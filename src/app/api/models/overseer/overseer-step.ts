import {Entity, EntityMapping} from 'ngx-entity-service';
import {TaskDefinition} from '../task-definition';
import {TaskStatus, TaskStatusEnum} from '../task-status';

export class OverseerStep extends Entity {
  id: number;
  taskDefinition: TaskDefinition;

  name: string;
  description: string;

  // Shown to the student's
  displayName: string;
  displayDescription: string;

  runCommand: string;
  timeoutMs: number;
  sortOrder: number;
  stepType: 'status_check' | 'output_diff';
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

  // constructor(json: any) {
  //   super();
  //   this.statusOnSuccess = TaskStatus.S;
  // }

  public override toJson<T extends Entity>(
    mappingData: EntityMapping<T>,
    ignoreKeys?: string[],
  ): object {
    return {
      overseer_step: super.toJson(mappingData, ignoreKeys),
    };
  }
}
