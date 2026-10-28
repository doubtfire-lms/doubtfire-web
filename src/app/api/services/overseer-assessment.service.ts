import {EntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {Task} from '../models/doubtfire-model';
import {OverseerAssessment} from '../models/overseer/overseer-assessment';
import {OverseerStepResultService} from './overseer-step-result.service';

@Injectable()
export class OverseerAssessmentService extends EntityService<OverseerAssessment> {
  protected readonly endpointFormat =
    'projects/:project_id:/task_def_id/:td_id:/submissions/timestamps/:timestamp:';
  protected readonly triggerEndpointFormat =
    'projects/:project_id:/task_def_id/:td_id:/overseer_assessment/:id:/trigger';

  constructor(
    httpClient: HttpClient,
    private overseerStepResultService: OverseerStepResultService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'submissionTimestamp',
      'taskId',
      'submissionHistoryId',
      'createdAt',
      'updatedAt',
      ['taskStatus', 'result_task_status'],
      ['submissionStatus', 'status'],
      {
        keys: ['timestamp', 'submission_timestamp'],
        toEntityFn: (data, _key, _entity, _params?) => {
          return new Date(data['submission_timestamp'] * 1000);
        },
      },
      ['timestampString', 'submission_timestamp'],
      {
        keys: 'overseerStepResults',
        toEntityOp: (data: object, key: string, overseerAssesment: OverseerAssessment) => {
          data[key]?.forEach((overseerStep) => {
            overseerAssesment.stepResultsCache.getOrCreate(
              overseerStep['id'],
              this.overseerStepResultService,
              overseerStep,
              {
                constructorParams: overseerAssesment,
              },
            );
          });
        },
      },
      'overseerStepId',
      'totalSteps',
      'passedSteps',
      'hasSubmissionFiles',
    );
  }

  public createInstanceFrom(_json: object, other?: Task): OverseerAssessment {
    return new OverseerAssessment(other);
  }

  public queryForTask(task: Task): Observable<OverseerAssessment[]> {
    const pathIds = {
      project_id: task.project.id,
      td_id: task.definition.id,
    };

    return this.query(pathIds, {
      constructorParams: task,
    });
  }

  public triggerOverseer(assessment: OverseerAssessment): Observable<OverseerAssessment> {
    const pathIds = {
      project_id: assessment.task.project.id,
      td_id: assessment.task.definition.id,
      id: assessment.id,
    };
    return this.put(pathIds, {endpointFormat: this.triggerEndpointFormat});
  }
}
