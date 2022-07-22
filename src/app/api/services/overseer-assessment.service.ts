import { Injectable } from '@angular/core';
import { EntityService } from 'ngx-entity-service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { OverseerAssessment } from '../models/overseer/overseer-assessment';

@Injectable()
export class OverseerAssessmentService extends EntityService<OverseerAssessment> {
  protected readonly endpointFormat = 'projects/:project_id:/task_def_id/:td_id:/submissions/timestamps/:timestamp:';
  protected readonly triggerEndpointFormat = 'projects/:project_id:/task_def_id/:td_id:/overseer_assessment/:id:/trigger';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'submissionTimestamp',
      'taskId',
      'createdAt',
      'updatedAt',
      ['taskStatus', 'result_task_status'],
      ['submissionStatus', 'status'],
      {
        keys: ['timestamp', 'submission_timestamp'],
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data['submission_timestamp'] * 1000);
        }
      },
      ['timestampString', 'submission_timestamp']
    );
  }

  public createInstanceFrom(json: any, other?: any): OverseerAssessment {
    return new OverseerAssessment(other);
  }

  public queryForTask(task: any): Observable<OverseerAssessment[]> {
    const pathIds = {
      project_id: task.project.id,
      td_id: task.definition.id
    };

    return this.query(pathIds, task);
  }

  public triggerOverseer(assessment: OverseerAssessment) : Observable<OverseerAssessment> {
    const pathIds = {
      project_id: assessment.task.project.id,
      td_id: assessment.task.definition.id,
      id: assessment.id
    }
    return this.put(pathIds, { endpointFormat: this.triggerEndpointFormat });
  }

}
