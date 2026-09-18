import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {Campus, Group, Tutorial, TutorialService} from 'src/app/api/models/doubtfire-model';
import {
  MoodleAssignment,
  MoodleConnectionResult,
  MoodleGroup,
  MoodleGroupMapping,
  MoodleIntegration,
  MoodleIntegrationValidationResult,
  MoodlePermissionResult,
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
  public prefilling = false;
  public validatingIntegration = false;
  public assignmentSyncIssue: string | null = null;
  public creatingTutorials: Set<number> = new Set();
  public editingGroupMappings: Set<MoodleGroupMapping> = new Set();
  public readonly tutorialDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Asynchronous',
  ];
  public studentImportAction: 'preview' | 'import' | null = null;
  public extensionImportAction: 'preview' | 'import' | null = null;
  private savedCourseId: number | null = null;
  private savedAssignmentId: number | null = null;
  private savedAssignmentName: string | null = null;
  private savedFetchExtensions = false;
  private savedAutoSyncStudents = false;
  private savedAutoSyncExtensions = false;
  private savedGroupMappingEnabled = false;
  private savedGroupMappings = '[]';

  constructor(
    private moodleService: MoodleIntegrationService,
    private tutorialService: TutorialService,
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
          this.editingGroupMappings.clear();
          this.integration.groupMappings.forEach((mapping) => (mapping.syncIssue = undefined));
          this.updateDuplicateMappingNotices();
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
    this.assignmentSyncIssue = null;
  }

  public extensionImportSettingChanged(enabled: boolean): void {
    if (!enabled) {
      this.assignmentSyncIssue = null;
    }
  }

  public get selectedAssignment(): MoodleAssignment | null {
    return (
      this.assignments.find((assignment) => assignment.id === this.integration.assignmentId) ?? null
    );
  }

  public get failedConnectionPermissions(): MoodlePermissionResult[] {
    return this.connection?.permissions.filter((permission) => !permission.success) ?? [];
  }

  public addGroupMapping(): void {
    const mapping = new MoodleGroupMapping();
    this.integration.groupMappings.push(mapping);
    this.editingGroupMappings.add(mapping);
  }

  public prefillGroupMappings(): void {
    if (!this.connection) {
      return;
    }

    this.prefilling = true;
    this.moodleService
      .prefillGroupMappings(this.unit.id, this.connection.groups)
      .pipe(
        finalize(() => {
          this.prefilling = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (result) => {
          const existingIds = new Set(
            this.integration.groupMappings.map((mapping) => mapping.moodleGroupId),
          );
          this.integration.groupMappings.push(
            ...result.groupMappings.filter((mapping) => !existingIds.has(mapping.moodleGroupId)),
          );
          this.integration.groupMappingEnabled = true;
          this.alerts.success('Moodle group mappings pre-filled.');
        },
        error: (error) => this.alerts.error(this.errorMessage(error)),
      });
  }

  public validateIntegration(): void {
    this.validatingIntegration = true;
    this.moodleService.validateIntegration(this.unit.id).subscribe({
      next: (job) => {
        this.validatingIntegration = false;
        this.showIntegrationValidation(job);
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.validatingIntegration = false;
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  public removeGroupMapping(index: number): void {
    this.editingGroupMappings.delete(this.integration.groupMappings[index]);
    this.integration.groupMappings.splice(index, 1);
    this.updateDuplicateMappingNotices();
  }

  public editGroupMapping(mapping: MoodleGroupMapping): void {
    this.editingGroupMappings.add(mapping);
  }

  public finishGroupMappingEdit(mapping: MoodleGroupMapping): void {
    if (!this.groupMappingValid(mapping)) {
      this.alerts.error('Complete this Moodle group mapping before finishing editing.');
      return;
    }
    mapping.syncIssue = undefined;
    this.editingGroupMappings.delete(mapping);
  }

  public groupMappingEditing(mapping: MoodleGroupMapping): boolean {
    return this.editingGroupMappings.has(mapping);
  }

  public moodleGroupSelected(mapping: MoodleGroupMapping): void {
    mapping.moodleGroupName =
      this.moodleGroups.find((group) => group.id === mapping.moodleGroupId)?.name ?? '';
    this.updateDuplicateMappingNotices();
  }

  public targetTypeSelected(mapping: MoodleGroupMapping): void {
    mapping.groupSetId = null;
    mapping.groupId = null;
    mapping.campusId = null;
    mapping.tutorialStreamId = null;
    mapping.tutorialId = null;
    mapping.createIfMissing = false;
    mapping.createTutorialIfMissing = false;
    mapping.tutorialDraft = undefined;
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

  public selectedTutorial(mapping: MoodleGroupMapping): Tutorial | undefined {
    return this.unit.tutorials.find((tutorial) => tutorial.id === mapping.tutorialId);
  }

  public selectedTutorialStream(mapping: MoodleGroupMapping): string {
    return (
      this.unit.tutorialStreams.find((stream) => stream.id === mapping.tutorialStreamId)
        ?.description ?? 'Stream not selected'
    );
  }

  public targetTypeLabel(mapping: MoodleGroupMapping): string {
    switch (mapping.targetType) {
      case 'group':
        return 'Group';
      case 'campus':
        return 'Campus';
      case 'tutorial':
        return 'Tutorial';
      case 'ignore':
        return 'Do nothing';
      default:
        return 'Not selected';
    }
  }

  public selectedTargetLabel(mapping: MoodleGroupMapping): string {
    if (mapping.targetType === 'campus') {
      return this.campuses.find((campus) => campus.id === mapping.campusId)?.name ?? 'Not selected';
    }
    if (mapping.targetType === 'group') {
      const groupSet = this.unit.groupSets.find((item) => item.id === mapping.groupSetId);
      if (mapping.createIfMissing) {
        return groupSet ? `${groupSet.name} · Create ${mapping.moodleGroupName}` : 'Not selected';
      }
      return groupSet?.groups.find((group) => group.id === mapping.groupId)?.name ?? 'Not selected';
    }
    return '';
  }

  public tutorialDraftValid(mapping: MoodleGroupMapping): boolean {
    const draft = mapping.tutorialDraft;
    return !!(
      draft?.abbreviation?.trim() &&
      draft.campusId &&
      draft.tutorialStreamId &&
      draft.meetingLocation?.trim() &&
      draft.meetingDay &&
      draft.meetingTime?.trim() &&
      Number.isInteger(Number(draft.capacity)) &&
      Number(draft.capacity) > 0 &&
      draft.tutorId
    );
  }

  public createTutorial(mapping: MoodleGroupMapping): void {
    const draft = mapping.tutorialDraft;
    if (!draft || !mapping.moodleGroupId || !this.tutorialDraftValid(mapping)) {
      return;
    }

    const tutorial = new Tutorial(this.unit);
    tutorial.abbreviation = draft.abbreviation.trim();
    tutorial.campus = this.campuses.find((campus) => campus.id === draft.campusId);
    tutorial.tutorialStream = this.unit.tutorialStreams.find(
      (stream) => stream.id === draft.tutorialStreamId,
    );
    tutorial.meetingLocation = draft.meetingLocation.trim();
    tutorial.meetingDay = draft.meetingDay;
    tutorial.meetingTime = draft.meetingTime.trim();
    tutorial.capacity = Number(draft.capacity);
    tutorial.tutor = this.unit.staffUsers.find((user) => user.id === draft.tutorId);

    this.creatingTutorials.add(mapping.moodleGroupId);
    this.tutorialService
      .create(
        {},
        {
          entity: tutorial,
          constructorParams: this.unit,
          cache: this.unit.tutorialsCache,
        },
      )
      .pipe(
        finalize(() => {
          this.creatingTutorials.delete(mapping.moodleGroupId);
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (created) => {
          mapping.tutorialStreamId = created.tutorialStream?.id ?? draft.tutorialStreamId;
          mapping.tutorialId = created.id;
          mapping.tutorialDraft = undefined;
          mapping.syncIssue = undefined;
          this.editingGroupMappings.delete(mapping);
          this.alerts.success(`Tutorial ${created.abbreviation} created.`);
        },
        error: (error) => this.alerts.error(this.errorMessage(error)),
      });
  }

  public get groupMappingsValid(): boolean {
    if (!this.integration.groupMappingEnabled) {
      return true;
    }
    if (!this.integration.groupMappings.length) {
      return false;
    }

    return this.integration.groupMappings.every((mapping) => this.groupMappingValid(mapping));
  }

  public groupMappingValid(mapping: MoodleGroupMapping): boolean {
    if (!mapping.moodleGroupId || !mapping.moodleGroupName || !mapping.targetType) {
      return false;
    }
    if (mapping.targetType === 'ignore') {
      return true;
    }
    if (mapping.targetType === 'campus') {
      return !!mapping.campusId;
    }
    if (mapping.targetType === 'tutorial') {
      return !!mapping.tutorialStreamId && !!mapping.tutorialId;
    }
    if (!mapping.groupSetId) {
      return false;
    }
    if (!mapping.createIfMissing) {
      return !!mapping.groupId;
    }
    return mapping.createTutorialIfMissing ? !!mapping.tutorialStreamId : !!mapping.tutorialId;
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
      this.integration.autoSyncStudents !== this.savedAutoSyncStudents ||
      this.integration.autoSyncExtensions !== this.savedAutoSyncExtensions ||
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
    this.savedAutoSyncStudents = this.integration.autoSyncStudents;
    this.savedAutoSyncExtensions = this.integration.autoSyncExtensions;
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
    this.updateDuplicateMappingNotices();
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
        const assignmentsLoaded = this.connection.permissions.find(
          (permission) => permission.function === 'mod_assign_get_assignments',
        )?.success;
        if (this.integration.fetchExtensions) {
          if (assignmentsLoaded) {
            this.reconcileMoodleAssignment();
          } else {
            this.integration.validated = false;
            this.integration.validatedAt = null;
            this.alerts.error(
              'Moodle assignments could not be checked, so the selected assignment was left unchanged.',
            );
          }
        }
        const groupsLoaded = this.connection.permissions.find(
          (permission) => permission.function === 'core_group_get_course_groups',
        )?.success;
        if (groupsLoaded) {
          this.reconcileMoodleGroupMappings();
        } else {
          this.integration.validated = false;
          this.integration.validatedAt = null;
          this.alerts.error(
            'Moodle groups could not be checked, so existing group mappings were left unchanged.',
          );
        }
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  private reconcileMoodleAssignment(): void {
    if (!this.integration.fetchExtensions || !this.integration.assignmentId) {
      return;
    }

    const selectedId = this.integration.assignmentId;
    const selectedName = this.integration.assignmentName;
    const liveAssignment = this.assignments.find((assignment) => assignment.id === selectedId);
    if (!liveAssignment) {
      this.assignmentSyncIssue = `The Moodle assignment “${selectedName}” no longer exists. Select another assignment.`;
    } else if (liveAssignment.name !== selectedName) {
      this.assignmentSyncIssue = `The Moodle assignment was renamed from “${selectedName}” to “${liveAssignment.name}”. Select it again to confirm the change.`;
    } else {
      this.assignmentSyncIssue = null;
      return;
    }

    this.integration.assignmentId = null;
    this.integration.assignmentName = null;
    this.integration.validated = false;
    this.integration.validatedAt = null;
  }

  private reconcileMoodleGroupMappings(): void {
    if (!this.connection) {
      return;
    }

    const liveGroups = new Map(this.connection.groups.map((group) => [group.id, group]));
    const knownGroupIds: Set<number> = new Set();

    for (const mapping of this.integration.groupMappings) {
      const groupId = mapping.moodleGroupId ?? mapping.syncIssue?.previousMoodleGroupId;
      if (!groupId) {
        continue;
      }

      knownGroupIds.add(groupId);
      const liveGroup = liveGroups.get(groupId);
      if (!liveGroup) {
        this.integration.validated = false;
        this.integration.validatedAt = null;
        if (mapping.syncIssue?.kind !== 'deleted') {
          const previousName = mapping.moodleGroupName;
          mapping.syncIssue = {
            kind: 'deleted',
            message: `The Moodle group “${previousName}” no longer exists. Select another Moodle group or delete this mapping.`,
            previousMoodleGroupId: groupId,
          };
          mapping.moodleGroupId = null;
        }
        this.editingGroupMappings.add(mapping);
        continue;
      }

      if (mapping.moodleGroupId === null) {
        mapping.moodleGroupId = liveGroup.id;
        mapping.syncIssue = {
          kind: 'added',
          message: `The Moodle group “${liveGroup.name}” is available again. Review and confirm this mapping.`,
        };
        this.editingGroupMappings.add(mapping);
      }
      if (mapping.moodleGroupName !== liveGroup.name) {
        this.integration.validated = false;
        this.integration.validatedAt = null;
        const previousName = mapping.moodleGroupName;
        mapping.moodleGroupName = liveGroup.name;
        mapping.syncIssue = {
          kind: 'renamed',
          message: `This Moodle group was renamed from “${previousName}” to “${liveGroup.name}”. Review and confirm this mapping.`,
        };
        this.editingGroupMappings.add(mapping);
      }
    }

    const missingGroups = this.connection.groups.filter((group) => !knownGroupIds.has(group.id));
    if (!missingGroups.length) {
      return;
    }

    this.prefilling = true;
    this.moodleService
      .prefillGroupMappings(this.unit.id, missingGroups)
      .pipe(
        finalize(() => {
          this.prefilling = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (result) => this.addNewMoodleGroupMappings(result.groupMappings),
        error: (error) => {
          const mappings = missingGroups.map((group) => {
            const mapping = new MoodleGroupMapping();
            mapping.moodleGroupId = group.id;
            mapping.moodleGroupName = group.name;
            return mapping;
          });
          this.addNewMoodleGroupMappings(mappings);
          this.alerts.error(
            `New Moodle groups were added for manual mapping, but automatic pre-fill failed: ${this.errorMessage(error)}`,
          );
        },
      });
  }

  private addNewMoodleGroupMappings(mappings: MoodleGroupMapping[]): void {
    this.integration.validated = false;
    this.integration.validatedAt = null;
    for (const mapping of mappings) {
      mapping.syncIssue = {
        kind: 'added',
        message: `The Moodle group “${mapping.moodleGroupName}” is new. Review and confirm this mapping.`,
      };
      this.integration.groupMappings.push(mapping);
      this.editingGroupMappings.add(mapping);
    }
    this.integration.groupMappingEnabled = true;
    this.updateDuplicateMappingNotices();
  }

  private showIntegrationValidation(job: SidekiqJob): void {
    if (!job?.id) {
      this.alerts.error('Failed to start Moodle integration validation.');
      return;
    }

    this.sidekiqProgressModal.show('Validating Moodle integration', job.id).subscribe({
      next: (completedJob) => {
        const result = JSON.parse(completedJob.result) as MoodleIntegrationValidationResult;
        this.integration.validated = result.valid;
        this.integration.validatedAt = result.validated_at;
        if (this.connection) {
          this.connection.groups = result.groups;
          this.moodleGroups = result.groups;
          this.reconcileMoodleGroupMappings();
        }
        this.assignments = result.assignments;
        this.reconcileMoodleAssignment();
        const assignmentIssue = result.issues.find((item) => item.type.startsWith('assignment_'));
        if (assignmentIssue && !this.assignmentSyncIssue) {
          this.assignmentSyncIssue = assignmentIssue.message;
        }
        this.updateDuplicateMappingNotices();
        for (const issue of result.issues.filter((item) => item.type === 'group_invalid')) {
          const mapping = this.integration.groupMappings.find(
            (item) => item.moodleGroupId === issue.moodle_group_id,
          );
          if (mapping) {
            mapping.syncIssue = {kind: 'invalid', message: issue.message};
            this.editingGroupMappings.add(mapping);
          }
        }
        if (result.valid) {
          this.alerts.success('Moodle integration is valid.');
        } else {
          this.alerts.error(
            'Moodle integration requires review. Resolve the highlighted settings, save, and validate again.',
          );
        }
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.integration.validated = false;
        this.integration.validatedAt = null;
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
        this.integration.validated = false;
        this.integration.validatedAt = null;
        this.alerts.error(this.errorMessage(error));
        this.changeDetector.markForCheck();
      },
    });
  }

  private updateDuplicateMappingNotices(): void {
    const mappingsByGroup: Map<number, MoodleGroupMapping[]> = new Map();
    for (const mapping of this.integration.groupMappings) {
      mapping.duplicateNotice = undefined;
      if (!mapping.moodleGroupId) {
        continue;
      }
      const mappings = mappingsByGroup.get(mapping.moodleGroupId) ?? [];
      mappings.push(mapping);
      mappingsByGroup.set(mapping.moodleGroupId, mappings);
    }

    for (const mappings of mappingsByGroup.values()) {
      if (mappings.length < 2) {
        continue;
      }
      const message = `This Moodle group has ${mappings.length} mappings; all will be applied.`;
      mappings.forEach((mapping) => (mapping.duplicateNotice = message));
    }
  }

  private errorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === 'object') {
      const response = error as {error?: unknown; message?: unknown};
      if (typeof response.error === 'string') {
        return response.error;
      }
      if (response.error && typeof response.error === 'object') {
        const body = response.error as {error?: unknown};
        if (typeof body.error === 'string') {
          return body.error;
        }
      }
      if (typeof response.message === 'string') {
        return response.message;
      }
    }
    return 'Moodle request failed.';
  }
}
