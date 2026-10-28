import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {TaskCableService} from 'src/app/api/services/task-cable.service';
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
    private taskCableService: TaskCableService,
  ) {}

  private task$: BehaviorSubject<Task> = new BehaviorSubject(null);
  private taskEventsSub: Subscription;
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
      this.taskService.get(task).subscribe((selectedTask) => this.selectTask(selectedTask));
    } else {
      this.selectTask(task);

      if (!task) {
        this.currentPdfUrl$.next(null);
        this.currentView$.next(DashboardViews.submission);
        this.checkFooterHeight();
        return;
      }
    }
    this.checkFooterHeight();
    this.showSubmission();
  }

  private selectTask(task: Task): void {
    this.task$.next(task);
    this.watchTaskEvents(task);
    task?.getSubmissionDetails().subscribe();
  }

  private watchTaskEvents(task: Task): void {
    this.taskEventsSub?.unsubscribe();
    this.taskEventsSub = this.taskCableService.eventsFor(task).subscribe((event) => {
      if (event !== 'status_changed' && event !== 'reconnected') {
        return;
      }
      task.getSubmissionDetails().subscribe(() => {
        if (this.task$.value === task && this.currentView$.value === DashboardViews.submission) {
          this.showSubmission();
        }
      });
    });
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
