import {Task, TaskComment, TestAttempt} from '../doubtfire-model';

export class ScormComment extends TaskComment {
  testAttempt: TestAttempt;

  // UI rendering data
  lastInScormSeries: boolean = false;

  constructor(task: Task) {
    super(task);
  }
}
