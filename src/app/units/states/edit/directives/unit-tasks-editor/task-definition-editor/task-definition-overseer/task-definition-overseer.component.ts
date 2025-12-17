import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {
  OverseerAssessment,
  OverseerImage,
  OverseerImageService,
  Task,
  TaskService,
  TaskStatusEnum,
  User,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {TaskAssessmentModalService} from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskSubmissionService} from 'src/app/common/services/task-submission.service';
import {OverseerScriptEditorModalService} from './overseer-script-editor-modal/overseer-script-editor-modal.service';
import {CodeModel} from '@ngstack/code-editor';
import {OverseerStep} from 'src/app/api/models/overseer/overseer-step';
import {OverseerStepService} from 'src/app/api/services/overseer-step.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'f-task-definition-overseer',
  templateUrl: 'task-definition-overseer.component.html',
  styleUrls: ['task-definition-overseer.component.scss'],
})
export class TaskDefinitionOverseerComponent implements OnChanges, OnInit {
  @Input() taskDefinition: TaskDefinition;

  public currentUserTask: Task;

  public model: CodeModel = {
    language: 'shell',
    uri: 'run.sh',
    value: '#!/bin/bash\n\n',
  };

  public stepType: 'status_check' | 'output_diff' = 'status_check';
  public visibility = 'public';
  constructor(
    private alerts: AlertService,
    private overseerImageService: OverseerImageService,
    private modalService: TaskAssessmentModalService,
    private submissions: TaskSubmissionService,
    private userService: UserService,
    private taskDefinitionService: TaskDefinitionService,
    private fileDownloaderService: FileDownloaderService,
    private overseerScriptEditorModal: OverseerScriptEditorModalService,
    private overseerStepService: OverseerStepService,
    private taskService: TaskService,
  ) {}

  public get statusKeys() {
    return this.taskService.statusKeys;
  }

  public statusName(status: TaskStatusEnum) {
    return this.taskService.statusLabels.get(status);
  }

  public selectedOverseerStep: OverseerStep = null;
  public newOverseerStep: OverseerStep = null;

  public overseerSteps: OverseerStep[] = [];

  selectStep(step: OverseerStep) {
    this.selectedOverseerStep = step;
    this.model = {
      language: 'shell',
      uri: 'run.sh',
      value: step.runCommand,
    };
  }

  addStep() {
    this.newOverseerStep = new OverseerStep();
    this.newOverseerStep.sortOrder = this.taskDefinition.overseerStepsCache.currentValues.length;
    this.selectedOverseerStep = this.newOverseerStep;
    this.model = {
      language: 'shell',
      uri: 'run.sh',
      value: '#!/bin/bash\n\n',
    };
  }

  ngOnInit(): void {
    this.taskDefinition.overseerStepsCache.values.subscribe((steps) => {
      this.overseerSteps = [...steps];
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.overseerSteps, event.previousIndex, event.currentIndex);
    // TODO: open endpoint to update sort orders in a single request
    for (let i = 0; i < this.overseerSteps.length; i++) {
      const step = this.taskDefinition.overseerStepsCache.get(this.overseerSteps[i].id);
      step.sortOrder = i;
      this.overseerStepService
        .update(
          {
            id: step.id,
            unitId: this.unit.id,
            taskDefId: this.taskDefinition.id,
          },
          {
            entity: step,
          },
        )
        .subscribe(() => {
          console.log('updated!');
        });
    }
  }

  saveStep() {
    if (!this.selectedOverseerStep.id) {
      this.newOverseerStep.runCommand = this.model.value;
      this.overseerStepService
        .create(
          {
            unitId: this.unit.id,
            taskDefId: this.taskDefinition.id,
          },
          {
            entity: this.newOverseerStep,
          },
        )
        .subscribe({
          next: (result) => {
            console.log(result);
            this.alerts.success('Added overseer step', 3000);
            this.taskDefinition.overseerStepsCache.getOrCreate(
              result.id,
              this.overseerStepService,
              result,
            );
            this.newOverseerStep = null;
          },
          error: (error) => {
            console.error(error);
            this.alerts.error(error, 3000);
          },
        });
    } else {
      console.log(this.selectedOverseerStep);
      this.selectedOverseerStep.runCommand = this.model.value;
      this.overseerStepService
        .update(
          {
            id: this.selectedOverseerStep.id,
            unitId: this.unit.id,
            taskDefId: this.taskDefinition.id,
          },
          {
            entity: this.selectedOverseerStep,
          },
        )
        .subscribe({
          next: (result) => {
            console.log(result);
            this.alerts.success('Saved overseer step', 3000);
          },
          error: (error) => {
            console.error(error);
            this.alerts.error(error, 3000);
          },
        });
    }
  }

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

  editScript() {
    this.overseerScriptEditorModal.show(this.taskDefinition);
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

  public removeOverseerResources() {
    this.taskDefinition.deleteOverseerResources().subscribe({
      next: () => {
        this.alerts.success('Deleted Overseer Resources', 2000);
        this.taskDefinition.hasTaskAssessmentResources = false;
      },
    });
  }

  public downloadOverseerResources() {
    this.fileDownloaderService.downloadFile(
      this.taskDefinition.getOverseerResourcesUrl(),
      this.taskDefinition.name + '.zip',
    );
  }

  public uploadOverseerResources(files: FileList) {
    const validFiles = Array.from(files as ArrayLike<File>).filter(
      (f) => f.type === 'application/zip' || f.type === 'application/x-zip-compressed',
    );
    if (validFiles.length > 0) {
      const file = validFiles[0];
      this.taskDefinitionService.uploadOverseerResources(this.taskDefinition, file).subscribe({
        next: () => {
          this.alerts.success('Uploaded Overseer Resources', 2000);
          this.taskDefinition.hasTaskAssessmentResources = true;
        },
        error: (message) => this.alerts.error(message, 6000),
      });
    } else {
      this.alerts.error('Please drop a zip with scripts for this task to upload', 6000);
    }
  }
}
