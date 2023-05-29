import { Component, Inject, Input, OnChanges, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { alertService } from 'src/app/ajs-upgraded-providers';
import {
  OverseerAssessment,
  OverseerImage,
  OverseerImageService,
  Task,
  User,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TaskAssessmentModalService } from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';

@Component({
  selector: 'f-task-definition-overseer',
  templateUrl: 'task-definition-overseer.component.html',
  styleUrls: ['task-definition-overseer.component.scss'],
})
export class TaskDefinitionOverseerComponent implements OnChanges {
  @Input() taskDefinition: TaskDefinition;

  public currentUserTask: Task;

  constructor(
    @Inject(alertService) private alerts: any,
    private overseerImageService: OverseerImageService,
    private modalService: TaskAssessmentModalService,
    private submissions: TaskSubmissionService,
    private userService: UserService
  ) {}

  public get overseerEnabled(): boolean {
    return this.unit.overseerEnabled();
  }

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public get images(): Observable<OverseerImage[]> {
    return this.overseerImageService.query();
  }

  get currentUser(): User {
    return this.userService.currentUser;
  }

  public ngOnChanges() {
    const proj = this.unit.findProjectForUsername(this.currentUser.username);
    if (proj) {
      this.currentUserTask = proj.findTaskForDefinition(this.taskDefinition.id);
      this.hasAnySubmissions();
    }
  }

  testSubmission() {
    if (!this.currentUserTask) {
      this.currentUserTask = new Task(this.unit);

      this.currentUserTask.definition = this.taskDefinition;
      this.currentUserTask.status = 'ready_for_feedback';
      this.currentUserTask.id = this.taskDefinition.id; // set a default id...
      this.hasAnySubmissions();
    }

    this.currentUserTask.presentTaskSubmissionModal(this.currentUserTask.status, false, true);
  }

  testSubmissionHistory() {
    this.modalService.show(this.currentUserTask);
  }

  private hasAnySubmissions() {
    if (!this.currentUserTask) return;

    this.submissions.getLatestSubmissionsTimestamps(this.currentUserTask).subscribe({
      next: (result: OverseerAssessment[]) => {},
      error: (error) => {
        this.alerts.add('danger', 'Error: ' + error, 6000);
      },
    });
  }
}
