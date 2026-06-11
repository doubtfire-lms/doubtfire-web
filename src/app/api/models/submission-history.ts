import {Entity} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Task} from './task';

export interface SubmissionArchive {
  id: number;
  task?: Task;
  timestamp: Date;
  timestampString: string;
  hasSubmissionFiles?: boolean;
  submissionFilesUrl(): string;
}

export class SubmissionHistory extends Entity implements SubmissionArchive {
  id: number;
  task?: Task;
  taskId?: number;
  timestamp: Date;
  timestampString: string;
  createdAt?: Date;
  hasSubmissionFiles?: boolean;
  overseerAssessmentId?: number;

  constructor(task?: Task) {
    super();
    this.task = task;
  }

  public submissionFilesUrl(): string {
    const constants = AppInjector.get(DoubtfireConstants);
    return `${constants.API_URL}/projects/${this.task.project.id}/task_def_id/${this.task.definition.id}/submission_histories/${this.id}/files`;
  }
}
