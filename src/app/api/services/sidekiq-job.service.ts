import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CachedEntityService} from 'ngx-entity-service';
import {Observable} from 'rxjs';
import API_URL from 'src/app/config/constants/apiURL';
import {SidekiqJob} from '../models/sidekiq-job';

@Injectable()
export class SidekiqJobService extends CachedEntityService<SidekiqJob> {
  protected readonly endpointFormat = 'sidekiq/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'jobClass',
      'status',
      {
        keys: 'pctComplete',
        toEntityOp: (data: object, jsonKey: string, job: SidekiqJob, _params?) => {
          job.pctComplete = Number(data[jsonKey]);
        },
      },
      'message',
      {
        keys: 'processedCount',
        toEntityOp: (data: object, jsonKey: string, job: SidekiqJob, _params?) => {
          job.processedCount = Number(data[jsonKey]);
        },
      },
      {
        keys: 'totalCount',
        toEntityOp: (data: object, jsonKey: string, job: SidekiqJob, _params?) => {
          job.totalCount = Number(data[jsonKey]);
        },
      },
      'result',
      'createdAt',
      'updatedAt',
    );

    this.mapping.addJsonKey(
      'id',
      'jobClass',
      'status',
      'message',
      'result',
      'createdAt',
      'updatedAt',
    );
  }

  public createInstanceFrom(_json: object): SidekiqJob {
    return new SidekiqJob();
  }

  public getSidekiqJob(jobId: string): Observable<SidekiqJob> {
    // TODO: cache the response to avoid fetching the same result data when the job is complete
    return this.fetch(
      {
        id: jobId,
      },
      {
        endpointFormat: this.endpointFormat,
      },
    );
  }

  // TODO: we could create endpoints to cancel/retry sidekiq jobs
}
