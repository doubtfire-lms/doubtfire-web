import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
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
      // 'runCommand',
      {
        keys: 'runCommand',
        toEntityFn: (data: object, key: string, entity: OverseerStep) => {
          const raw = data['run_command'];
          if (raw?.startsWith('b64:')) {
            entity.decodedRunCommand = atob(raw.slice(4));
          } else {
            entity.decodedRunCommand = raw;
          }

          return raw;
        },
      },
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

  public createInstanceFrom(_json: object, other?: TaskDefinition): OverseerStep {
    return new OverseerStep(other);
  }
}
