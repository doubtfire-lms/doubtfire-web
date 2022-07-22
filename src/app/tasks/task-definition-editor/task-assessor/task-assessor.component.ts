import { Component, Input, Inject, OnChanges } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { OverseerAssessment, TaskDefinition, Unit, User, UserService, Task } from 'src/app/api/models/doubtfire-model';
import { TaskAssessmentModalService } from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';

@Component({
  selector: 'task-assessor',
  templateUrl: './task-assessor.component.html',
  styleUrls: ['./task-assessor.component.scss']
})
export class TaskAssessorComponent implements OnChanges {
  @Input() taskDefinition: TaskDefinition;
  @Input() unit: Unit;
  public currentUserTask: Task;

  constructor(
    @Inject(alertService) private alerts: any,
    private userService: UserService,
    private modalService: TaskAssessmentModalService,
    private submissions: TaskSubmissionService) {
  }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error, 6000);
  }

  ngOnChanges() {
    const proj = this.unit.findProjectForUsername(this.currentUser.username);
    if ( proj ) {
      this.currentUserTask = proj.findTaskForDefinition(this.taskDefinition.id);
      this.hasAnySubmissions();
    }
  }

  get currentUser(): User {
    return this.userService.currentUser;
  }

  testSubmission() {
    console.log("implement test submission");
    // this.taskDefinition.unit.id = this.unit.id;
    // var task = this.currentUserTask
    // if ( ! task ) {
    //   task = {
    //     definition: this.taskDefinition
    //   }
    // }
    // task.id = this.taskDefinition.id;
    // task.unit_id = this.unit.id,

    // this.ts.presentTaskSubmissionModal(task, this.taskDefinition.status, false, true, this.unit);
  }

  testSubmissionHistory() {
    this.modalService.show(this.currentUserTask);
  }

  hasAnySubmissions() {
    if (!this.currentUserTask) return;

    this.submissions.getLatestSubmissionsTimestamps(this.currentUserTask)
    .subscribe({
      next: (result: OverseerAssessment[]) => {},
      error: (error) => {}
    });
  }
}
