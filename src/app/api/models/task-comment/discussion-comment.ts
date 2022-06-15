import { Task, TaskComment } from '../doubtfire-model'

/**
 * Create a Discussion Comment, extending the base TaskComment class
 */
export class DiscussionComment extends TaskComment {
  numberOfPrompts: 1;
  status: string;
  timeDiscussionComplete: string;
  timeDiscussionStarted: string;

  // Do we need this do you think?
  constructor(task: Task) {
    super(task); // delay update from json
  }
}
