import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppInjector } from 'src/app/app-injector';
import { TaskComment } from './task-comment';
import { TaskCommentService } from './task-comment.service';

/**
 * Create a Discussion Comment, extending the base TaskComment class
 */
export class ExtensionComment extends TaskComment {
  assessed: boolean;
  granted: boolean;
  extensionResponse: string;
  date_assessed: Date;
  weeksRequested: number;

  taskStatus: string;
  taskDueDate: string;
  taskExtensions: number;

  // Do we need this do you think?
  constructor(initialData: object, task: any) {
    super(initialData, task); // delay update from json
  }

  /**
   * Update the Discussion Comment with details from the passed in json data
   */
  public updateFromJson(data: any): void {
    super.updateFromJson(data);
    this.assessed = data.assessed;
    this.extensionResponse = data.extension_response;
    this.granted = data.granted;
    this.date_assessed = new Date(data.date_assessed);
    this.weeksRequested = data.weeks_requested;

    this.taskStatus = data.task_status;
    this.taskDueDate = data.due_date;
    this.taskExtensions = data.extensions;
  }

  public toJson(): any {
    return {
      granted: this.granted ? 1 : 0,

      projectId: this.project.id,
      taskDefinitionId: this.task.task_definition_id,
      id: this.id,
    };
  }

  private assessExtension(): Observable<TaskComment> {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    return tcs.assessExtension(this).pipe(
      tap((tc: TaskComment) => {
        const extension: ExtensionComment = tc as ExtensionComment;

        const task = tc.task;
        task.due_date = extension.taskDueDate;
        task.extensions = extension.taskExtensions;
        task.status = extension.taskStatus;

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
