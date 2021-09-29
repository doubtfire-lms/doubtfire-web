import { Injectable } from '@angular/core';
import { OverseerAssessment } from './overseer-assessment';
import { EntityService } from '../../entity.service';
import { Observable } from 'rxjs';

@Injectable()
export class OverseerAssessmentService extends EntityService<OverseerAssessment> {
  protected readonly endpointFormat = 'projects/:project_id:/task_def_id/:td_id:/submissions/timestamps/:timestamp:';
  entityName = 'OverseerAssessment';

  protected createInstanceFrom(json: any, other?: any): OverseerAssessment {
    const result = new OverseerAssessment(json, other);
    result.updateFromJson(json);
    return result;
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  public queryForTask(task: any): Observable<OverseerAssessment[]> {
    const pathIds = {
      project_id: task.project().project_id,
      td_id: task.task_definition_id
    };

    return this.query(pathIds, task);
  }

}
