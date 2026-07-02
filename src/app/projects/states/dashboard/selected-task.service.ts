import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {GlobalStateService} from '../index/global-state.service';

export enum DashboardViews {
  details,
  submission,
  task,
  similarity,
  staff_notes,
  tutor_notes,
  discussion_prompts,
  submission_history,
}

@Injectable({
  providedIn: 'root',
})
export class SelectedTaskService {
  constructor(
    private taskService: TaskService,
    private globalState: GlobalStateService,
  ) {}

  private task$: BehaviorSubject<Task> = new BehaviorSubject(null);
  public currentPdfUrl$: BehaviorSubject<string> = new BehaviorSubject(null);

  public currentView$: BehaviorSubject<DashboardViews> = new BehaviorSubject(
    DashboardViews.submission,
  );

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

      if (!task) {
        this.currentPdfUrl$.next(null);
        this.currentView$.next(DashboardViews.submission);
        this.checkFooterHeight();
        return;
      }

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

  public showStaffNotes() {
    this.currentView$.next(DashboardViews.staff_notes);
  }

  public showTutorNotes() {
    this.currentView$.next(DashboardViews.tutor_notes);
  }

  public showOverseerReports() {
    this.currentView$.next(DashboardViews.submission_history);
  }

  public showSubmissionHistory() {
    this.currentView$.next(DashboardViews.submission_history);
  }

  public showDiscussionPrompts() {
    this.currentView$.next(DashboardViews.discussion_prompts);
  }

  public showSubmission() {
    if (!this.task$.value) {
      return;
    }
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
