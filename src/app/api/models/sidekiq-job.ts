import {Entity} from 'ngx-entity-service';

export class SidekiqJob extends Entity {
  id: string;
  status: 'working' | 'queued' | 'complete' | 'retrying' | 'failed';
  message?: string;

  pctComplete: number;
  processedCount?: number;
  totalCount?: number;

  jobClass: string; // name of the job, eg "StudentImportJob"

  // Custom data unique to each job
  result?: string;

  createdAt: Date;
  updatedAt: Date;
}
