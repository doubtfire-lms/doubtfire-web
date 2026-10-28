import {Entity} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {DiscussionPromptService} from '../services/discussion-prompt.service';
import {Project, TaskDefinition, Unit, User} from './doubtfire-model';

export class DiscussionPrompt extends Entity {
  id: number;
  unit: Unit;
  taskDefinition: TaskDefinition;
  project: Project | null;
  createdBy: User;
  content: string;
  priority: number;
  discussedAt: Date;

  public readonly PRIORITY = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
  } as const;

  constructor(data?: Project | TaskDefinition | Unit) {
    super();
    if (data) {
      if (data instanceof Project) {
        this.project = data;
      } else if (data instanceof TaskDefinition) {
        this.taskDefinition = data;
      } else if (data instanceof Unit) {
        this.unit = data;
      }
    } else {
      console.error('Failed to get project');
    }
  }

  public get priorityLabel() {
    return this.PRIORITY[this.priority] ?? this.priority;
  }

  public delete() {
    const discussionPromptService: DiscussionPromptService =
      AppInjector.get(DiscussionPromptService);
    discussionPromptService
      .delete(
        {task_definition_id: this.taskDefinition.id, id: this.id},
        {cache: this.taskDefinition.discussionPromptsCache},
      )
      .subscribe({
        next: (_response: object) => {
          AppInjector.get(AlertService).success('Successfully deleted discussion note', 4000);
        },
        error: (error: Error) => {
          const message = error.message || 'Unknown error';
          AppInjector.get(AlertService).error(message, 2000);
        },
      });
  }
}
