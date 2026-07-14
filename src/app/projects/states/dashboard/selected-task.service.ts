import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {TaskCableService} from 'src/app/api/services/task-cable.service';
import {TaskService} from 'src/app/api/services/task.service';
import {GlobalStateService} from '../index/global-state.service';

export enum DashboardViews {
  submission,
  task,
  similarity,
  staff_notes,
  tutor_notes,
  discussion_prompts,
  overseer,
}

@Injectable({
  providedIn: 'root',
})
export class SelectedTaskService {
  constructor(
    private taskService: TaskService,
    private globalState: GlobalStateService,
    private taskCableService: TaskCableService,
  ) {
    this.taskCableService.events$.subscribe((event) => {
      const task = this.task$.value;
      if (
        event.event === 'status_changed' &&
        task?.project?.id === event.projectId &&
        task?.definition?.id === event.taskDefinitionId
      ) {
        task.getSubmissionDetails().subscribe(() => {
          if (this.currentView$.value === DashboardViews.submission) {
            this.showSubmission();
          }
        });
      }
    });
  }

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
      this.taskService.get(task).subscribe((selectedTask) => this.selectTask(selectedTask));
    } else {
      this.selectTask(task);
    }
    this.checkFooterHeight();
    this.showSubmission();
  }

  private selectTask(task: Task): void {
    this.task$.next(task);
    this.taskCableService.subscribeToTask(task);
    task?.getSubmissionDetails().subscribe();
  }

  public showTaskSheet() {
    this.currentPdfUrl$.next(this.task$.value?.definition?.getTaskPDFUrl(false));
    this.currentView$.next(DashboardViews.task);
  }

  public showSimilarity() {
    this.currentView$.next(DashboardViews.similarity);
  }

  public showStaffNotes() {
    this.currentView$.next(DashboardViews.staff_notes);
  }

  public showTutorNotes() {
    this.currentView$.next(DashboardViews.tutor_notes);
  }

  public showOverseerReports() {
    this.currentView$.next(DashboardViews.overseer);
  }

  public showDiscussionPrompts() {
    this.currentView$.next(DashboardViews.discussion_prompts);
  }

  public showSubmission() {
    if (!this.task$.value) return;
    this.currentPdfUrl$.next(this.task$.value.submissionUrl(false));
    this.currentView$.next(DashboardViews.submission);
  }

  public get selectedTask$(): Subject<Task> {
    return this.task$;
  }

  public get selectedTask(): Task {
    return this.task$.value;
  }
}
