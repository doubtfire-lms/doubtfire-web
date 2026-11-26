import {Entity, EntityMapping} from 'ngx-entity-service';
import {OverseerAssessment} from './overseer-assessment';
import {OverseerStep} from './overseer-step';

export class OverseerStepResult extends Entity {
  id: number;
  overseerAssessment: OverseerAssessment;
  overseerStep: OverseerStep;
  overseerStepId: number;

  exitStatus: number;
  pass: boolean;
  stdout: string;
  stdin: string;
  expectedOutput: string;
  stdoutSha256: string;
  stdinSha256: string;
  expectedOutputSha256: string;
  feedbackMessage: string;

  constructor(oa?: OverseerAssessment, _os?: OverseerStep) {
    super();
    this.overseerAssessment = oa;
    // this.overseerStep = os;
  }

  public override toJson<T extends Entity>(
    mappingData: EntityMapping<T>,
    ignoreKeys?: string[],
  ): object {
    return {
      overseer_step_result: super.toJson(mappingData, ignoreKeys),
    };
  }
}
