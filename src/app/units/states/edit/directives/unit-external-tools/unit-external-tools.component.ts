import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {Campus, Group, Tutorial} from 'src/app/api/models/doubtfire-model';
import {
  MoodleAssignment,
  MoodleConnectionResult,
  MoodleGroup,
  MoodleGroupMapping,
  MoodleIntegration,
} from 'src/app/api/models/moodle-integration';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {CampusService} from 'src/app/api/services/campus.service';
import {MoodleIntegrationService} from 'src/app/api/services/moodle-integration.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {
  CsvResult,
  CsvResultModalService,
} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-unit-external-tools',
  templateUrl: './unit-external-tools.component.html',
  standalone: false,
})
export class UnitExternalToolsComponent implements OnInit {
  @Input({required: true}) unit: Unit;

  public integration: MoodleIntegration;
  public apiKey = '';
  public editingApiKey = false;
  public assignments: MoodleAssignment[] = [];
  public moodleGroups: MoodleGroup[] = [];
  public campuses: Campus[] = [];
  public connection: MoodleConnectionResult | null = null;
  public saving = false;
  public testing = false;
  public studentImportAction: 'preview' | 'import' | null = null;
  public extensionImportAction: 'preview' | 'import' | null = null;
  private savedCourseId: number | null = null;
  private savedAssignmentId: number | null = null;
  private savedAssignmentName: string | null = null;
  private savedFetchExtensions = false;
  private savedGroupMappingEnabled = false;
  private savedGroupMappings = '[]';

  constructor(
    private moodleService: MoodleIntegrationService,
    private campusService: CampusService,
    private sidekiqProgressModal: SidekiqProgressModalService,
    private csvResultModal: CsvResultModalService,
    private confirmationModal: ConfirmationModalService,
    private alerts: AlertService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    this.integration = new MoodleIntegration(this.unit);
    this.campusService.query().subscribe((campuses) => (this.campuses = campuses));
    this.moodleService.getSettings(this.unit).subscribe({
      next: (integration) => {
        this.integration = integration;
        this.restoreSavedAssignment();
        this.restoreSavedGroups();
        this.rememberSavedSettings();
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  public save(): void {
    const courseId = Number(this.integration.courseId);
    if (
      !Number.isInteger(courseId) ||
      courseId <= 0 ||
      (!this.integration.apiKeyConfigured && !this.apiKey)
    ) {
      this.alerts.error('Enter a Moodle course ID and API key.');
      return;
    }
    if (!this.groupMappingsValid) {
      this.alerts.error('Complete each Moodle group mapping before saving.');
      return;
    }

    this.integration.courseId = courseId;
    this.saving = true;
    this.moodleService
      .updateSettings(this.integration, this.apiKey)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (integration) => {
          this.integration = integration;
          this.apiKey = '';
          this.rememberSavedSettings();
          this.alerts.success('Moodle settings saved.');
        },
        error: (error) => this.alerts.error(this.errorMessage(error)),
      });
  }

  public testConnection(): void {
    this.testing = true;
    this.connection = null;
    this.moodleService.testConnection(this.unit.id).subscribe({
      next: (job) => {
        this.testing = false;
        this.showConnectionTest(job);
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.testing = false;
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  public importStudents(previewOnly: boolean): void {
    if (!previewOnly) {
      this.confirmationModal.show(
        'Import Moodle students?',
        `Make sure Moodle course ID ${this.integration.courseId} is the intended course. Run Preview student import first and verify the student details and any group, campus, or tutorial mappings before continuing.`,
        () => this.startStudentImport(false),
        undefined,
        'Import students',
      );
      return;
    }

    this.startStudentImport(true);
  }

  public importExtensions(previewOnly: boolean): void {
    if (!previewOnly) {
      this.confirmationModal.show(
        'Import Moodle extensions?',
        `Make sure Moodle course ID ${this.integration.courseId} and assignment ${this.integration.assignmentName} (ID ${this.integration.assignmentId}) are correct. Run Preview extension import first and verify the extension dates and special consideration days before continuing.`,
        () => this.startExtensionImport(false),
        undefined,
        'Import extensions',
      );
      return;
    }

    this.startExtensionImport(true);
  }

  private startStudentImport(previewOnly: boolean): void {
    this.studentImportAction = previewOnly ? 'preview' : 'import';
    this.moodleService.importStudents(this.unit.id, previewOnly).subscribe({
      next: (job) => {
        this.studentImportAction = null;
        this.showImportJob(
          job,
          previewOnly ? 'Previewing Moodle student import' : 'Importing Moodle students',
          previewOnly ? 'Moodle Student Import Preview' : 'Moodle Student Import Results',
          previewOnly,
          !previewOnly,
        );
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.studentImportAction = null;
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  private startExtensionImport(previewOnly: boolean): void {
    this.extensionImportAction = previewOnly ? 'preview' : 'import';
    this.moodleService.importExtensions(this.unit.id, previewOnly).subscribe({
      next: (job) => {
        this.extensionImportAction = null;
        this.showImportJob(
          job,
          previewOnly ? 'Previewing Moodle extension import' : 'Importing Moodle extensions',
          previewOnly ? 'Moodle Extension Import Preview' : 'Moodle Extension Import Results',
          previewOnly,
          !previewOnly,
        );
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.extensionImportAction = null;
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  public assignmentSelected(assignmentId: number | null): void {
    this.integration.assignmentName =
      this.assignments.find((assignment) => assignment.id === assignmentId)?.name ?? null;
  }

  public addGroupMapping(): void {
    this.integration.groupMappings.push({
      moodleGroupId: null,
      moodleGroupName: '',
      targetType: null,
      groupSetId: null,
      groupId: null,
      campusId: null,
      tutorialStreamId: null,
      tutorialId: null,
      createIfMissing: false,
      createTutorialIfMissing: false,
    });
  }

  public removeGroupMapping(index: number): void {
    this.integration.groupMappings.splice(index, 1);
  }

  public moodleGroupSelected(mapping: MoodleGroupMapping): void {
    mapping.moodleGroupName =
      this.moodleGroups.find((group) => group.id === mapping.moodleGroupId)?.name ?? '';
  }

  public targetTypeSelected(mapping: MoodleGroupMapping): void {
    mapping.groupSetId = null;
    mapping.groupId = null;
    mapping.campusId = null;
    mapping.tutorialStreamId = null;
    mapping.tutorialId = null;
    mapping.createIfMissing = false;
    mapping.createTutorialIfMissing = false;
  }

  public groupSetSelected(mapping: MoodleGroupMapping): void {
    mapping.groupId = null;
  }

  public tutorialStreamSelected(mapping: MoodleGroupMapping): void {
    mapping.tutorialId = null;
  }

  public createIfMissingChanged(mapping: MoodleGroupMapping): void {
    if (mapping.createIfMissing) {
      mapping.groupId = null;
      mapping.tutorialId = null;
      mapping.tutorialStreamId = null;
      mapping.createTutorialIfMissing = false;
    } else if (mapping.targetType === 'group') {
      mapping.tutorialId = null;
      mapping.tutorialStreamId = null;
      mapping.createTutorialIfMissing = false;
    }
  }

  public groupTutorialModeChanged(
    mapping: MoodleGroupMapping,
    createTutorialIfMissing: boolean,
  ): void {
    mapping.createTutorialIfMissing = createTutorialIfMissing;
    mapping.tutorialId = null;
    mapping.tutorialStreamId = null;
  }

  public groupsFor(groupSetId: number | null): readonly Group[] {
    return this.unit.groupSets.find((groupSet) => groupSet.id === groupSetId)?.groups ?? [];
  }

  public tutorialsFor(tutorialStreamId: number | null): readonly Tutorial[] {
    return this.unit.tutorials.filter(
      (tutorial) => tutorial.tutorialStream?.id === tutorialStreamId,
    );
  }

  public get groupMappingsValid(): boolean {
    if (!this.integration.groupMappingEnabled) {
      return true;
    }
    if (!this.integration.groupMappings.length) {
      return false;
    }

    return this.integration.groupMappings.every((mapping) => {
      if (!mapping.moodleGroupId || !mapping.moodleGroupName || !mapping.targetType) {
        return false;
      }
      if (mapping.targetType === 'campus') {
        return !!mapping.campusId;
      }
      if (mapping.targetType === 'tutorial') {
        return !!mapping.tutorialStreamId && (mapping.createIfMissing || !!mapping.tutorialId);
      }
      if (!mapping.groupSetId) {
        return false;
      }
      if (!mapping.createIfMissing) {
        return !!mapping.groupId;
      }
      return mapping.createTutorialIfMissing ? !!mapping.tutorialStreamId : !!mapping.tutorialId;
    });
  }

  public get apiKeyInputValue(): string {
    if (this.editingApiKey || this.apiKey) {
      return this.apiKey;
    }
    return this.integration.apiKeyConfigured ? '*********************' : '';
  }

  public updateApiKey(value: string): void {
    this.apiKey = value;
  }

  public get settingsDirty(): boolean {
    const assignmentId = this.integration.fetchExtensions ? this.integration.assignmentId : null;
    return (
      this.apiKey.length > 0 ||
      this.integration.courseId !== this.savedCourseId ||
      this.integration.fetchExtensions !== this.savedFetchExtensions ||
      assignmentId !== this.savedAssignmentId ||
      this.integration.assignmentName !== this.savedAssignmentName ||
      this.integration.groupMappingEnabled !== this.savedGroupMappingEnabled ||
      JSON.stringify(this.integration.groupMappings) !== this.savedGroupMappings
    );
  }

  public get connectionSettingsDirty(): boolean {
    return this.apiKey.length > 0 || this.integration.courseId !== this.savedCourseId;
  }

  private rememberSavedSettings(): void {
    this.savedCourseId = this.integration.courseId;
    this.savedAssignmentId = this.integration.assignmentId;
    this.savedAssignmentName = this.integration.assignmentName;
    this.savedFetchExtensions = this.integration.fetchExtensions;
    this.savedGroupMappingEnabled = this.integration.groupMappingEnabled;
    this.savedGroupMappings = JSON.stringify(this.integration.groupMappings);
  }

  private restoreSavedAssignment(): void {
    if (this.integration.assignmentId && this.integration.assignmentName) {
      this.assignments = [
        {
          id: this.integration.assignmentId,
          name: this.integration.assignmentName,
          duedate: 0,
        },
      ];
    }
  }

  private restoreSavedGroups(): void {
    this.moodleGroups = this.integration.groupMappings.map((mapping) => ({
      id: mapping.moodleGroupId,
      name: mapping.moodleGroupName,
    }));
  }

  private showConnectionTest(job: SidekiqJob): void {
    if (!job?.id) {
      this.alerts.error('Failed to start Moodle connection test.');
      return;
    }

    this.sidekiqProgressModal.show('Testing Moodle API connection', job.id).subscribe({
      next: (completedJob) => {
        this.connection = JSON.parse(completedJob.result) as MoodleConnectionResult;
        this.assignments = this.connection.assignments;
        this.moodleGroups = this.connection.groups;
        this.assignmentSelected(this.integration.assignmentId);
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  private showImportJob(
    job: SidekiqJob,
    progressTitle: string,
    resultTitle: string,
    previewOnly: boolean,
    refreshStudents: boolean,
  ): void {
    if (!job?.id) {
      this.alerts.error('Failed to start Moodle import job.');
      return;
    }

    this.sidekiqProgressModal.show(progressTitle, job.id).subscribe({
      next: (completedJob) => {
        const result = JSON.parse(completedJob.result) as CsvResult;
        this.csvResultModal.show(
          resultTitle,
          result,
          previewOnly ? 'Preview complete' : 'Import complete',
        );
        if (refreshStudents && (result.success?.length ?? 0) > 0) {
          this.unit.refreshStudents(true);
        }
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  private errorMessage(error: {error?: {error?: string}; message?: string}): string {
    return error?.error?.error || error?.message || 'Moodle request failed.';
  }
}
