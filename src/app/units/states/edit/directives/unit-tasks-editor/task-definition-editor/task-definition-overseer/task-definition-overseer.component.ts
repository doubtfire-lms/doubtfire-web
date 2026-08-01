import * as monaco from 'monaco-editor';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {Observable, Subscription, finalize, forkJoin, of, shareReplay, tap} from 'rxjs';
import {
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

@Component({
  selector: 'f-task-definition-overseer',
  templateUrl: 'task-definition-overseer.component.html',
  styleUrls: ['task-definition-overseer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDefinitionOverseerComponent implements OnChanges, OnDestroy, OnInit {
  @Input() taskDefinition: TaskDefinition;

  @ViewChild('editor') editorComponent;

  public currentUserTask: Task;

  editorOptions = {
    theme: 'vs',
    language: 'shell',
    automaticLayout: true,
    renderMinimap: false,

    minimap: {
      enabled: false,
    },
  };

  public stepType: 'status_check' | 'output_diff' = 'status_check';
  public visibility = 'public';
  public showOverseerResourcesEditor = false;
  public isLoadingOverseerResourcesArchive = false;
  public overseerResourcesArchive: Blob | File | null = null;
  public images: Observable<OverseerImage[]>;

  constructor(
    private http: HttpClient,
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
  private overseerStepsSubscription?: Subscription;
  private readonly stepSaveRequests: Map<OverseerStep, Observable<OverseerStep>> = new Map();

  onRunCommandChange(step: OverseerStep, value: string) {
    step.runCommand = `b64:${this.base64UrlEncode(value)}`;
  }

  private base64UrlEncode(str) {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

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
    this.newOverseerStep.timeout = 30;
    this.newOverseerStep.enabled = true;
    this.newOverseerStep.showStdout = true;
    this.newOverseerStep.statusOnFailure = 'no_change';
    this.newOverseerStep.statusOnSuccess = 'no_change';
    this.newOverseerStep.commandLanguage = 'shell';
    this.newOverseerStep.decodedRunCommand = '#!/usr/bin/env bash\n\n';
    this.newOverseerStep.runCommand = '#!/usr/bin/env bash\n\n';
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
    this.images = this.overseerImageService.query();
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
            // console.log('updated!');
          },
          error: (error) => {
            this.alerts.error(`Failed to update order of steps: ${error}`, 6000);
          },
        });
    }
  }

  deleteStep() {
    if (this.selectedOverseerStep && this.selectedOverseerStep === this.newOverseerStep) {
      this.newOverseerStep = null;
      this.selectedOverseerStep = null;
      return;
    }
    this.selectedOverseerStep?.delete();
    this.selectedOverseerStep = null;
  }

  saveStep() {
    this.saveStepWithFeedback(this.selectedOverseerStep);
  }

  public saveStepFromRow(step: OverseerStep, event: MouseEvent): void {
    event.stopPropagation();
    this.saveStepWithFeedback(step);
  }

  public overseerStepHasUnsavedChanges(step: OverseerStep): boolean {
    if (step === this.newOverseerStep) {
      return true;
    }

    return (
      Object.keys(
        (
          step.toJson(this.overseerStepService.mapping) as {
            overseer_step: object;
          }
        ).overseer_step,
      ).length > 0
    );
  }

  public isSavingStep(step: OverseerStep): boolean {
    return this.stepSaveRequests.has(step);
  }

  public saveOverseerSteps(): Observable<OverseerStep[]> {
    const stepsToSave = this.taskDefinition.overseerStepsCache.currentValues.filter((step) =>
      this.overseerStepHasUnsavedChanges(step),
    );

    if (this.newOverseerStep) {
      stepsToSave.push(this.newOverseerStep);
    }

    if (stepsToSave.length === 0) {
      return of([]);
    }

    return forkJoin(stepsToSave.map((step) => this.saveStepRequest(step)));
  }

  public get overseerEnabled(): boolean {
    return this.unit.overseerEnabled;
  }

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  get currentUser(): User {
    return this.userService.currentUser;
  }

  public taskDefinitionHasChanges(): boolean {
    return this.taskDefinition.hasChanges(this.taskDefinitionService.mapping);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['taskDefinition']) {
      this.selectedOverseerStep = null;
      this.newOverseerStep = null;
      this.subscribeToOverseerSteps();
      this.showOverseerResourcesEditor = false;
      this.isLoadingOverseerResourcesArchive = false;
      this.overseerResourcesArchive = null;
    }

    this.currentUserTask = null;
    const proj = this.unit.findProjectForUsername(this.currentUser.username);
    if (proj) {
      this.currentUserTask = proj.findTaskForDefinition(this.taskDefinition.id);
      this.hasAnySubmissions();
    }
  }

  public ngOnDestroy(): void {
    this.overseerStepsSubscription?.unsubscribe();
  }

  testSubmission() {
    if (!this.currentUserTask) {
      this.currentUserTask = new Task(this.unit);

      this.currentUserTask.definition = this.taskDefinition;
      this.currentUserTask.status = 'ready_for_feedback';
      this.currentUserTask.id = this.taskDefinition.id; // set a default id...
      // this.hasAnySubmissions();
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
    if (!this.currentUserTask) {
      return;
    }

    this.submissions.getLatestSubmissionsTimestamps(this.currentUserTask).subscribe({
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
        this.showOverseerResourcesEditor = false;
        this.overseerResourcesArchive = null;
      },
    });
  }

  public downloadOverseerResources() {
    this.fileDownloaderService.downloadFile(
      this.taskDefinition.getOverseerResourcesUrl(),
      this.taskDefinition.name + '.zip',
    );
  }

  public uploadOverseerResources(files: ArrayLike<File>) {
    const validFiles = Array.from(files as ArrayLike<File>).filter(
      (f) => f.type === 'application/zip' || f.type === 'application/x-zip-compressed',
    );
    if (validFiles.length > 0) {
      const file = validFiles[0];
      this.taskDefinitionService.uploadOverseerResources(this.taskDefinition, file).subscribe({
        next: (resourceFiles) => {
          this.alerts.success('Uploaded Overseer Resources', 2000);
          this.taskDefinition.hasTaskAssessmentResources = true;
          this.taskDefinition.overseerResourceFiles = [...resourceFiles];
          this.overseerResourcesArchive = file;
        },
        error: (message) => this.alerts.error(message, 6000),
      });
    } else {
      this.alerts.error('Please drop a zip with scripts for this task to upload', 6000);
    }
  }

  public toggleOverseerResourcesEditor() {
    this.showOverseerResourcesEditor = !this.showOverseerResourcesEditor;
    if (
      this.showOverseerResourcesEditor &&
      !this.overseerResourcesArchive &&
      this.taskDefinition?.hasTaskAssessmentResources
    ) {
      this.loadOverseerResourcesArchive();
    }
  }

  public onOverseerResourcesArchiveSaved(response: HttpResponse<unknown>) {
    this.taskDefinition.hasTaskAssessmentResources = true;

    if (Array.isArray(response.body)) {
      this.taskDefinition.overseerResourceFiles = response.body.filter(
        (file): file is string => typeof file === 'string',
      );
    }
  }

  private loadOverseerResourcesArchive() {
    this.isLoadingOverseerResourcesArchive = true;
    this.http.get(this.taskDefinition.getOverseerResourcesUrl(), {responseType: 'blob'}).subscribe({
      next: (archiveBlob) => {
        this.overseerResourcesArchive = archiveBlob;
      },
      error: (error) => {
        this.isLoadingOverseerResourcesArchive = false;
        this.showOverseerResourcesEditor = false;
        this.alerts.error(`Failed to load Overseer Resources Zip: ${error?.error?.error ?? error}`);
      },
      complete: () => {
        this.isLoadingOverseerResourcesArchive = false;
      },
    });
  }

  private persistStep(step: OverseerStep): Observable<OverseerStep> {
    const taskDefinition = step.taskDefinition ?? this.taskDefinition;
    const unit = taskDefinition.unit;

    if (step.id) {
      return this.overseerStepService.update(
        {
          id: step.id,
          unitId: unit.id,
          taskDefId: taskDefinition.id,
        },
        {
          entity: step,
          cache: taskDefinition.overseerStepsCache,
        },
      );
    }

    return this.overseerStepService
      .create(
        {
          unitId: unit.id,
          taskDefId: taskDefinition.id,
        },
        {
          entity: step,
        },
      )
      .pipe(
        tap((result) => {
          result.taskDefinition = taskDefinition;
          taskDefinition.overseerStepsCache.add(result);

          if (this.selectedOverseerStep === step) {
            this.selectStep(result);
          }

          if (this.newOverseerStep === step) {
            this.newOverseerStep = null;
          }
        }),
      );
  }

  private saveStepRequest(step: OverseerStep): Observable<OverseerStep> {
    const existingRequest = this.stepSaveRequests.get(step);
    if (existingRequest) {
      return existingRequest;
    }

    const request = this.persistStep(step).pipe(
      finalize(() => this.stepSaveRequests.delete(step)),
      shareReplay({bufferSize: 1, refCount: false}),
    );
    this.stepSaveRequests.set(step, request);
    return request;
  }

  private saveStepWithFeedback(step: OverseerStep): void {
    if (!step) {
      return;
    }

    const isNewStep = !step.id;

    this.saveStepRequest(step).subscribe({
      next: () => {
        this.alerts.success(isNewStep ? 'Added overseer step' : 'Saved overseer step', 3000);
      },
      error: (error) => {
        console.error(error);
        this.alerts.error(error, 3000);
      },
    });
  }

  private subscribeToOverseerSteps(): void {
    this.overseerStepsSubscription?.unsubscribe();
    this.overseerStepsSubscription = this.taskDefinition.overseerStepsCache.values.subscribe(
      (steps) => {
        this.overseerSteps = [...steps];

        if (this.selectedOverseerStep?.id) {
          const refreshedSelection = steps.find((step) => step.id === this.selectedOverseerStep.id);
          if (refreshedSelection) {
            this.selectedOverseerStep = refreshedSelection;
          }
        }
      },
    );
  }
}
