import { Component, Input, Inject, OnChanges } from '@angular/core';
import { taskService, alertService, currentUser } from 'src/app/ajs-upgraded-providers';
import { OverseerAssessment } from 'src/app/api/models/doubtfire-model';
import { TaskAssessmentModalService } from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';

@Component({
  selector: 'task-assessor',
  templateUrl: './task-assessor.component.html',
  styleUrls: ['./task-assessor.component.scss']
})
export class TaskAssessorComponent implements OnChanges {
  @Input() taskDefinition: any;
  @Input() unit: any;
  public _hasAnySubmissions: boolean;
  public currentUserTask: any; // Task

  constructor(
    @Inject(alertService) private alerts: any,
    @Inject(taskService) private ts: any,
    @Inject(currentUser) private currentUser: any,
    private modalService: TaskAssessmentModalService,
    private submissions: TaskSubmissionService) {
  }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error, 6000);
  }

  ngOnChanges() {
    const proj = this.unit.findProjectForUsername(this.currentUser.profile.username);
    this.currentUserTask = proj.findTaskForDefinition(this.taskDefinition.id);

    this.hasAnySubmissions();
  }

  testSubmission() {
    this.taskDefinition.unit_id = this.unit.id;
    this.ts.presentTaskSubmissionModal(this.currentUserTask, this.taskDefinition.status, false, true);
  }

  testSubmissionHistory() {
    this.modalService.show(this.currentUserTask);
  }

  hasAnySubmissions() {
    if (!this.currentUserTask) return;

    this.submissions.getLatestSubmissionsTimestamps(this.currentUserTask)
    .subscribe({
      next: ((result: OverseerAssessment[]) => {
        if (result.length === 0) {
          this._hasAnySubmissions = false;
          this.currentUserTask.has_any_submissions = false;
        } else {
          this._hasAnySubmissions = true;
          this.currentUserTask.has_any_submissions = true;
        }
      }).bind(this),
      error: ((error) => {
        this._hasAnySubmissions = false;
        this.currentUserTask.has_any_submissions = false;
      }).bind(this)
    });
  }
}
