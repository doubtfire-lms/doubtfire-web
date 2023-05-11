import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Task } from 'src/app/api/models/task';
import { TaskService } from 'src/app/api/services/task.service';

export enum DashboardViews {
  details,
  submission,
  task,
  similarity,
}

@Injectable({
  providedIn: 'root',
})
export class SelectedTaskService {
  constructor(private taskService: TaskService) {}

  private task$ = new BehaviorSubject<Task>(null);
  public currentPdfUrl$ = new BehaviorSubject<string>(null);

  private currentView: DashboardViews = DashboardViews.submission;

  public showingTaskSheet(task?: Task) {
    return this.currentView == DashboardViews.task && task?.definition?.hasTaskSheet;
  }

  public get showingSimilarity() {
    return this.currentView == DashboardViews.similarity;
  }

  public showingSubmission(task?: Task) {
    return this.currentView == DashboardViews.submission && task?.hasPdf;
  }

  public setSelectedTask(task: number | Task) {
    if (typeof task === 'number') {
      this.taskService.get(task).subscribe(this.task$);
    } else {
      this.task$.next(task);
    }
    this.showSubmission();
  }

  public showTaskSheet() {
    this.currentPdfUrl$.next(this.task$.value?.definition?.getTaskPDFUrl(false));
    this.currentView = DashboardViews.task;
  }

  public showSimilarity() {
    this.currentView = DashboardViews.similarity;
  }

  public showSubmission() {
    if (!this.task$.value) return;
    this.currentPdfUrl$.next(this.task$.value.submissionUrl(false));
    this.currentView = DashboardViews.submission;
  }

  public get selectedTask$(): Subject<Task> {
    return this.task$;
  }
}
