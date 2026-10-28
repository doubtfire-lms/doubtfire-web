import {ChangeDetectionStrategy, Component, Inject, Input} from '@angular/core';
import {Task} from 'src/app/api/models/doubtfire-model';
import {TaskAssessmentModalService} from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {
  TaskAssessmentResult,
  TaskSubmissionService,
} from 'src/app/common/services/task-submission.service';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface TaskAssessmentComment {
  text: string;
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
  overseerAssessmentId: number;
  overseerPassedSteps: number;
  overseerTotalSteps: number;
  overseerInProgress: boolean;
  overseerStatus: string;
}

@Component({
  selector: 'app-task-assessment-comment',
  templateUrl: './task-assessment-comment.component.html',
  styleUrls: ['./task-assessment-comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskAssessmentCommentComponent {
  @Input() task: Task;
  @Input() comment: TaskAssessmentComment;

  constructor(
    private alerts: AlertService,
    @Inject(TaskSubmissionService) private submissions: TaskSubmissionService,
    private modalService: TaskAssessmentModalService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(error: any) {
    this.alerts.error('Error: ' + error, 6000);
  }

  get message() {
    return this.comment.assessment_result.assessment_output;
  }

  showTaskAssessmentResult(overseerAssessmentId?: number) {
    this.modalService.show(this.task, overseerAssessmentId);
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }

  update(): void {
    this.submissions.getLatestTaskAssessment(this.task).subscribe(
      (result) => {
        this.comment.assessment_result = {
          assessment_output: result.result,
          is_completed: true,
          is_successful: true,
          task: this.task,
        };
      },
      (error) => {
        this.comment.assessment_result = {
          assessment_output: error.error,
          is_completed: false,
          is_successful: false,
          task: this.task,
        };
      },
    );
  }
}
