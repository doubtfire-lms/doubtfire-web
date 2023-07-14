import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Task } from 'src/app/api/models/task';
import { TaskService } from 'src/app/api/services/task.service';
import { GlobalStateService } from '../index/global-state.service';

export enum DashboardViews {
  submission,
  task,
  similarity,
}

@Injectable({
  providedIn: 'root',
})
export class SelectedTaskService {
  constructor(private taskService: TaskService, private globalState: GlobalStateService) {}

  private task$ = new BehaviorSubject<Task>(null);
  public currentPdfUrl$ = new BehaviorSubject<string>(null);

  public currentView$ = new BehaviorSubject<DashboardViews>(DashboardViews.submission);

  public get hasTaskSheet(): boolean {
    return this.task$.value?.definition?.hasTaskSheet;
  }

  public get hasSubmissionPdf(): boolean {
    return this.task$.value?.hasPdf;
  }

  public checkFooterHeight() {
    if (this.task$.getValue()?.similaritiesDetected) {
      this.globalState.showFooterWarning();
    } else {
      this.globalState.hideFooterWarning();
    }
  }

  public setSelectedTask(task: number | Task) {
    if (typeof task === 'number') {
      this.taskService.get(task).subscribe(this.task$);
    } else {
      this.task$.next(task);

      task?.getSubmissionDetails().subscribe();
    }
    this.checkFooterHeight();
    this.showSubmission();
  }

  public showTaskSheet() {
    this.currentPdfUrl$.next(this.task$.value?.definition?.getTaskPDFUrl(false));
    this.currentView$.next(DashboardViews.task);
  }

  public showSimilarity() {
    this.currentView$.next(DashboardViews.similarity);
  }

  public showSubmission() {
    if (!this.task$.value) return;
    this.currentPdfUrl$.next(this.task$.value.submissionUrl(false));
    this.currentView$.next(DashboardViews.submission);
  }

  public get selectedTask$(): Subject<Task> {
    return this.task$;
  }
}
