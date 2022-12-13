import { Component, OnInit, Input, Inject, Output, ChangeDetectionStrategy } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { TaskSubmissionService, TaskAssessmentResult } from 'src/app/common/services/task-submission.service';
import { TaskAssessmentModalService } from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import { Task } from 'src/app/api/models/doubtfire-model';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface TaskAssessmentComment {
  id?: number;
  comment: string;
  has_attachment?: boolean;
  type: string;
  is_new?: boolean;
  author?: User;
  recipient?: User;
  created_at?: string;
  recipient_read_time?: Date;
  // new fields that extend regular Comment Interface. TODO: create a separate Comment entity and extend it.
  assessment_result?: TaskAssessmentResult;
}

@Component({
  selector: 'app-task-assessment-comment',
  templateUrl: './task-assessment-comment.component.html',
  styleUrls: ['./task-assessment-comment.component.scss'],
})
export class TaskAssessmentCommentComponent implements OnInit {
  @Input() task: Task;
  @Input() comment: TaskAssessmentComment;

  constructor(
    @Inject(alertService) private alerts: any,
    @Inject(TaskSubmissionService) private submissions: TaskSubmissionService,
    private modalService: TaskAssessmentModalService) { }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error, 6000);
  }

  ngOnInit() {
    this.update();
  }

  get message() {
    return this.comment.assessment_result.assessment_output;
  }

  showTaskAssessmentResult() {
    this.modalService.show(this.task);
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }

  update(): void {
    this.submissions.getLatestTaskAssessment(this.task)
    .subscribe(
      result => {
        this.comment.assessment_result = {
          assessment_output: result.result,
          is_completed: true,
          is_successful: true,
          task: this.task
        };
      },
      error => {
        this.comment.assessment_result = {
          assessment_output: error.error,
          is_completed: false,
          is_successful: false,
          task: this.task
        };
      }
    );
  }
}

