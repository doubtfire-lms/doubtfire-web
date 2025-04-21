import { Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
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
import { TaskDefinitionService } from 'src/app/api/services/task-definition.service';
import { TaskAssessmentModalService } from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import { AlertService } from 'src/app/common/services/alert.service';
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
    private alerts: AlertService,
    private overseerImageService: OverseerImageService,
    private modalService: TaskAssessmentModalService,
    private submissions: TaskSubmissionService,
    private userService: UserService,
    private taskDefinitionService: TaskDefinitionService
  ) {}

  public get overseerEnabled(): boolean {
    return this.unit.overseerEnabled;
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
        this.alerts.error('Error: ' + error, 6000);
      },
    });
  }

  public uploadOverseerResources(files: FileList) {
    const validFiles = Array.from(files as ArrayLike<File>).filter(
      (f) => f.type === 'application/zip' || f.type === 'application/x-zip-compressed',
    );
    if (validFiles.length > 0) {
      const file = validFiles[0];
      this.taskDefinitionService.uploadTaskResources(this.taskDefinition, file).subscribe({
        next: () => this.alerts.success('Uploaded task sheet', 2000),
        error: (message) => this.alerts.error(message, 6000),
      });
    } else {
      this.alerts.error('Please drop a PDF to upload for this task', 6000);
    }
  }
}
