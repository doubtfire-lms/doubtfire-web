import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {OverseerAssessment} from '../models/doubtfire-model';
import {OverseerStepResult} from '../models/overseer/overseer-step-result';

@Injectable()
export class OverseerStepResultService extends CachedEntityService<OverseerStepResult> {
  protected readonly endpointFormat =
    'units/:unitId:/task_definitions/:taskDefId:/overseer_step_results/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'overseerStepId',
      'exitStatus',
      'pass',
      'feedbackMessage',
      'stdout',
      'stdin',
      'expectedOutput',
      'stdoutSha256',
      'stdinSha256',
      'expectedOutputSha256',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(_json: object, other?: OverseerAssessment): OverseerStepResult {
    return new OverseerStepResult(other);
  }

  public getOverseerStepResults(assessment: OverseerAssessment): Observable<OverseerStepResult[]> {
    const pathIds = {
      projectId: assessment.task.project.id,
      taskDefId: assessment.task.definition.id,
      id: assessment.id,
    };

    return this.query(pathIds, {
      endpointFormat:
        'projects/:projectId:/task_definitions/:taskDefId:/overseer_assessments_results/:id:',
      constructorParams: assessment.task,
      cache: assessment.stepResultsCache,
    });
  }
}
