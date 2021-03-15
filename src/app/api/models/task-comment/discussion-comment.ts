import { TaskComment } from './task-comment';

/**
 * Create a Discussion Comment, extending the base TaskComment class
 */
export class DiscussionComment extends TaskComment {
  numberOfPrompts: 1;
  status: string;
  timeDiscussionComplete: string;
  timeDiscussionStarted: string;

  // Do we need this do you think?
  constructor(initialData: object, task: any) {
    super(initialData, task); // delay update from json
  }

  /**
   * Update the Discussion Comment with details from the passed in json data
   */
  public updateFromJson(data: any): void {
    super.updateFromJson(data);
    this.status = data.status;
    this.numberOfPrompts = data.number_of_prompts;
    this.timeDiscussionComplete = data.time_discussion_completed;
    this.timeDiscussionStarted = data.time_discussion_started;
  }
}
