import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {SidekiqJob} from '../models/sidekiq-job';

export interface SidekiqJobEntry {
  job?: SidekiqJob;
  title: string;
  resultSubject: Subject<SidekiqJob>;
}

@Injectable()
export class SidekiqJobService extends CachedEntityService<SidekiqJob> {
  protected readonly endpointFormat = 'sidekiq/:id:';

  public jobEntries: Map<string, SidekiqJobEntry> = new Map();

  // Allow components to track changes to jobEntries
  public sidekiqJobsSubject: BehaviorSubject<SidekiqJobEntry[]> = new BehaviorSubject([]);

  public setJob(jobId: string, title: string, subject: Subject<SidekiqJob>, job?: SidekiqJob) {
    this.jobEntries.set(jobId, {
      job,
      title,
      resultSubject: subject,
    });
    this.emitJobs();
  }

  public removeJob(jobId: string) {
    this.jobEntries.delete(jobId);
    this.emitJobs();
  }

  private emitJobs() {
    this.sidekiqJobsSubject.next(Array.from(this.jobEntries.values()));
  }

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
