import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
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
import {OverseerStep} from 'src/app/api/models/overseer/overseer-step';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {OverseerStepService} from 'src/app/api/services/overseer-step.service';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {TaskAssessmentModalService} from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskSubmissionService} from 'src/app/common/services/task-submission.service';
import {OverseerScriptEditorModalService} from './overseer-script-editor-modal/overseer-script-editor-modal.service';
import * as monaco from 'monaco-editor';
import {MatSelectChange} from '@angular/material/select';
@Component({
  selector: 'f-task-definition-overseer',
  templateUrl: 'task-definition-overseer.component.html',
  styleUrls: ['task-definition-overseer.component.scss'],
})
export class TaskDefinitionOverseerComponent implements OnChanges, OnInit {
  @Input() taskDefinition: TaskDefinition;

  @ViewChild('editor') editorComponent;

  public currentUserTask: Task;

  editorOptions = {
    theme: 'vs',
    language: 'shell',
    renderMinimap: false,

    minimap: {
      enabled: false,
    },
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
    setTimeout(() => {
      const editor = this.editorComponent?._editor;
      if (editor) {
        editor.revealLine(1);
        editor.setScrollPosition({scrollTop: 0});
      }
    });
  }

  addStep() {
    this.newOverseerStep = new OverseerStep(this.taskDefinition);
    this.newOverseerStep.stepType = 'status_check';
    this.newOverseerStep.timeoutMs = 5;
    this.newOverseerStep.enabled = true;
    this.newOverseerStep.showStdout = true;
    this.newOverseerStep.statusOnFailure = 'no_change';
    this.newOverseerStep.statusOnSuccess = 'no_change';
    this.newOverseerStep.commandLanguage = 'shell';
    this.newOverseerStep.runCommand = '#!/bin/bash\n\n';
    this.newOverseerStep.showExpectedOutput = true;

    this.newOverseerStep.sortOrder = this.taskDefinition.overseerStepsCache.currentValues.length;
    this.selectedOverseerStep = this.newOverseerStep;
  }

  getFeedbackMessagePlaceholder() {
    // If the feedback message is blank, this is what will automatically be used
    // (If this changes, ensure to update it in AcceptOverseerJob)
    switch (this.selectedOverseerStep.stepType) {
      case 'status_check':
        return 'This test did not complete successfully. Check the output for any errors.';
      case 'output_diff':
        return 'Your output did not match the expected result.';
    }
  }

  ngOnInit(): void {
    this.taskDefinition.overseerStepsCache.values.subscribe((steps) => {
      this.overseerSteps = [...steps];
    });

    console.log(monaco.languages.getLanguages());

    // setInterval(() => {
    //   if (this.editorComponent) {
    //     console.log(monaco.languages.getLanguages());
    //     // console.log(this.editorComponent._editor.getLanguages());
    //   }
    // }, 1000);
  }

  public get getLanguages() {
    return monaco?.languages.getLanguages() ?? [];
  }

  onLanguageChange(event: MatSelectChange) {
    const value = event.value;
    this.editorOptions.language = value;
    this.editorOptions = {...this.editorOptions};
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.newOverseerStep) {
      this.alerts.error('Please save changes before re-ordering steps', 3000);
      return;
    }
    moveItemInArray(this.overseerSteps, event.previousIndex, event.currentIndex);
    // TODO: open endpoint to update sort orders in a single request
    for (let i = 0; i < this.overseerSteps.length; i++) {
      const step = this.taskDefinition.overseerStepsCache.get(this.overseerSteps[i].id);
      if (step.sortOrder === i) {
        // Ignore if no change
        continue;
      }
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
            constructorParams: this.taskDefinition,
          },
        )
        .subscribe({
          next: () => {
            console.log('updated!');
          },
          error: (error) => {
            console.error(error);
          },
        });
    }
  }

  deleteStep() {
    this.selectedOverseerStep?.delete();
    this.selectedOverseerStep = null;
  }

  saveStep() {
    if (!this.selectedOverseerStep.id) {
      // this.newOverseerStep.runCommand = this.model.value;
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
            result.taskDefinition = this.taskDefinition;
            this.taskDefinition.overseerStepsCache.add(result);
            this.selectStep(result);
            this.newOverseerStep = null;
          },
          error: (error) => {
            console.error(error);
            this.alerts.error(error, 3000);
          },
        });
    } else {
      this.overseerStepService
        .update(
          {
            id: this.selectedOverseerStep.id,
            unitId: this.unit.id,
            taskDefId: this.taskDefinition.id,
          },
          {
            entity: this.selectedOverseerStep,
            cache: this.taskDefinition.overseerStepsCache,
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
