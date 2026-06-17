import {EntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SubmissionHistory} from 'src/app/api/models/submission-history';
import {Task} from 'src/app/api/models/task';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class SubmissionHistoryService extends EntityService<SubmissionHistory> {
  protected readonly endpointFormat =
    'projects/:project_id:/task_def_id/:td_id:/submission_histories/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'taskId',
      'createdAt',
      'hasSubmissionFiles',
      'overseerAssessmentId',
      {
        keys: ['timestamp', 'submission_timestamp'],
        toEntityFn: (data) => new Date(Number(data['submission_timestamp']) * 1000),
      },
      ['timestampString', 'submission_timestamp'],
    );
  }

  public createInstanceFrom(_json: object, task?: Task): SubmissionHistory {
    return new SubmissionHistory(task);
  }

  public queryForTask(task: Task): Observable<SubmissionHistory[]> {
    return this.query(
      {
        project_id: task.project.id,
        td_id: task.definition.id,
      },
      {constructorParams: task},
    );
  }
}
