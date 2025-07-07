import {Entity} from 'ngx-entity-service';
import {Task} from './doubtfire-model';

export class TestAttempt extends Entity {
  id: number;
  terminated: boolean;
  completionStatus: boolean;
  successStatus: boolean;
  scoreScaled: number;
  cmiDatamodel: string;
  attemptedTime: Date;

  task: Task;

  constructor(task: Task) {
    super();
    this.task = task;
  }

  /**
   * Open a test attempt window in review mode
   */
  public review() {
    const url = `#/projects/${this.task.project.id}/task_def_id/${this.task.taskDefId}/scorm-player/review/${this.id}`;

    window.open(url, '_blank');
  }
}
