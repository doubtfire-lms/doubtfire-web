import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CachedEntityService} from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiUrl';
import {OverseerStep} from '../models/overseer/overseer-step';
import {TaskDefinition} from '../models/task-definition';

@Injectable()
export class OverseerStepService extends CachedEntityService<OverseerStep> {
  protected readonly endpointFormat =
    'units/:unitId:/task_definitions/:taskDefId:/overseer_steps/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      // 'taskDefinition',
      'name',
      'description',
      'displayName',
      'displayDescription',
      'runCommand',
      'timeout',
      'sortOrder',
      'stepType',
      'partialOutputDiff',
      'stdinInputFile',
      'expectedOutputFile',
      'feedbackMessage',
      'statusOnSuccess',
      'statusOnFailure',
      'haltOnSuccess',
      'haltOnFailure',
      'showExpectedOutput',
      'showStdin',
      'showStdout',
      'enabled',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: object, other?: any): OverseerStep {
    return new OverseerStep(other as TaskDefinition);
  }
}
