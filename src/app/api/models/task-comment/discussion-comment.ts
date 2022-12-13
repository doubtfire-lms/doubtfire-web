import { AppInjector } from 'src/app/app-injector';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
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

  public get responseUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${this.project.id}/task_def_id/${this.task.definition.id}/comments/${this.id}/discussion_comment/response?as_attachment=false`;
  }

  public generateDiscussionPromptUrl(prompt: number): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${this.task.project.id}/task_def_id/${this.task.definition.id}/comments/${this.id}/discussion_comment/prompt_number/${prompt}?as_attachment=false`;
  }
}
