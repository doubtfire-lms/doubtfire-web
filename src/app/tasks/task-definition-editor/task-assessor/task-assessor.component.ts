import { Component, OnInit, Input, Inject } from '@angular/core';
import { taskService, Task, alertService } from 'src/app/ajs-upgraded-providers';
import { TaskAssessmentModalService } from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';

@Component({
  selector: 'task-assessor',
  templateUrl: './task-assessor.component.html',
  styleUrls: ['./task-assessor.component.scss']
})
export class TaskAssessorComponent implements OnInit {
  @Input() task: any;
  @Input() unit: any;
  public _hasAnySubmissions: boolean;

  constructor(
    @Inject(alertService) private alerts: any,
    @Inject(taskService) private ts: any,
    @Inject(TaskAssessmentModalService) private modalService: TaskAssessmentModalService,
    @Inject(TaskSubmissionService) private submissions: TaskSubmissionService) { }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error, 6000);
  }

  ngOnInit() {
    this.hasAnySubmissions();
  }

  ngOnChanges() {
    this.hasAnySubmissions();
  }

  testSubmission() {
    this.task.unit_id = this.unit.id;
    this.ts.presentTaskSubmissionModal(this.task, this.task.status, false, true);
  }

  testSubmissionHistory() {
    this.modalService.show(this.task);
  }

  hasAnySubmissions() {
    this.submissions.getLatestSubmissionsTimestamps(this.task)
    .subscribe(
      (result) => {
        if (result.length === 0) {
          this._hasAnySubmissions = false;
          this.task.has_any_submissions = false;
        } else {
          this._hasAnySubmissions = true;
          this.task.has_any_submissions = true;
        }
      },
      (error) => {
        this._hasAnySubmissions = false;
        this.task.has_any_submissions = false;
      }
    );
  }
}
