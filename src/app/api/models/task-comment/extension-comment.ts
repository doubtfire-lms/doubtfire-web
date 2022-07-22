import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppInjector } from 'src/app/app-injector';
import { TaskCommentService } from '../../services/task-comment.service';
import { TaskComment, TaskStatusEnum, Task } from '../doubtfire-model';

/**
 * Create a Discussion Comment, extending the base TaskComment class
 */
export class ExtensionComment extends TaskComment {
  assessed: boolean;
  granted: boolean;
  extensionResponse: string;
  dateAssessed: Date;
  weeksRequested: number;

  taskStatus: string;
  taskDueDate: Date;
  taskExtensions: number;

  // Do we need this do you think?
  constructor(task: Task) {
    super(task); // delay update from json
  }

  // public toJson(): any {
  //   return {
  //     granted: this.granted ? 1 : 0,

  //     projectId: this.project.id,
  //     taskDefinitionId: this.task.definition.id,
  //     id: this.id,
  //   };
  // }

  private assessExtension(): Observable<TaskComment> {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    return tcs.assessExtension(this).pipe(
      tap((tc: TaskComment) => {
        const extension: ExtensionComment = tc as ExtensionComment;

        const task = tc.task;
        task.dueDate = extension.taskDueDate;
        task.extensions = extension.taskExtensions;
        task.status = extension.taskStatus as TaskStatusEnum;

        tc.project.updateBurndownChart();
        tc.project.calcTopTasks(); // Sort the task list again
      })
    );
  }

  public deny(): Observable<TaskComment> {
    this.granted = false;
    return this.assessExtension();
  }

  public grant(): Observable<TaskComment> {
    this.granted = true;
    return this.assessExtension();
  }
}
