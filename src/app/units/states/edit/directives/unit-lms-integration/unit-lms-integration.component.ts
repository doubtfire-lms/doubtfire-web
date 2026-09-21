import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {Campus, Group, Tutorial, TutorialService} from 'src/app/api/models/doubtfire-model';
import {
  LmsAssignment,
  LmsCourseData,
  LmsGradeLineItemStatus,
  LmsGroup,
  LmsGroupMapping,
  LmsIntegration,
  LmsIntegrationValidationResult,
  LmsLink,
  LmsOverview,
  LmsToggleSetting,
} from 'src/app/api/models/lms-integration';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {CampusService} from 'src/app/api/services/campus.service';
import {LmsIntegrationService} from 'src/app/api/services/lms-integration.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {
  CsvResult,
  CsvResultModalService,
} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {errorMessage} from 'src/app/common/services/error-message';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

const TOGGLE_LABELS: Record<LmsToggleSetting, string> = {
  fetchExtensions: 'Fetch extensions from assignment',
  autoSyncStudents: 'Sync students daily',
  withdrawMissingStudents: 'Withdraw missing students',
  autoSyncExtensions: 'Sync extensions daily',
  groupMappingEnabled: 'Map LMS groups',
  skipUngraded: 'Skip ungraded students',
  sendGradeRationale: 'Send grade rationale as feedback',
};

@Component({
  selector: 'f-unit-lms-integration',
  templateUrl: './unit-lms-integration.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitLmsIntegrationComponent implements OnInit {
  @Input({required: true}) unit: Unit;

  public loading = true;
  public refreshing = false;
  public link: LmsLink | null = null;
  public linkError: string | null = null;
  public integration: LmsIntegration;
  public courseData: LmsCourseData | null = null;
  public loadingCourseData = false;
  public gradeLineItem: LmsGradeLineItemStatus | null = null;
  public gradeLineItemError: string | null = null;
  public loadingGradeLineItem = false;
  public retryingGradeLineItem = false;
  public gradeSyncAction: 'preview' | 'sync' | null = null;
  public unlinking = false;
  public assignments: LmsAssignment[] = [];
  public lmsGroups: LmsGroup[] = [];
  public campuses: Campus[] = [];
  public saving = false;
  public prefilling = false;
  public validatingIntegration = false;
  public assignmentSyncIssue: string | null = null;
  public validationIssues: string[] = [];
  public editingAssignment = false;
  public assignmentDraftId: number | null = null;
  public savingAssignment = false;
  public creatingTutorials: Set<number> = new Set();
  public preparingTutorialDrafts: Set<LmsGroupMapping> = new Set();
  public editingGroupMappings: Set<LmsGroupMapping> = new Set();
  public groupMappingsExpanded = false;
  public togglesSaving: Set<LmsToggleSetting> = new Set();
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
  private savedGroupMappings = '[]';

  constructor(
    private lmsService: LmsIntegrationService,
    private tutorialService: TutorialService,
    private campusService: CampusService,
    private sidekiqProgressModal: SidekiqProgressModalService,
    private csvResultModal: CsvResultModalService,
    private confirmationModal: ConfirmationModalService,
    private alerts: AlertService,
    private changeDetector: ChangeDetectorRef,
    private constants: DoubtfireConstants,
  ) {}

  public get externalName() {
    return this.constants.ExternalName;
  }

  public ngOnInit(): void {
    this.integration = new LmsIntegration(this.unit);
    this.campusService.query().subscribe((campuses) => (this.campuses = campuses));
    this.loadOverview();
  }

  public loadOverview(): void {
    this.loading = true;
    this.lmsService
      .getOverview(this.unit)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (overview) => this.applyOverview(overview, false),
        error: (error) => (this.linkError = this.errorMessage(error)),
      });
  }

  // Reloads the link, grade item and course data in place, keeping unsaved settings
  public refresh(): void {
    this.refreshing = true;
    this.lmsService
      .getOverview(this.unit)
      .pipe(
        finalize(() => {
          this.refreshing = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (overview) => this.applyOverview(overview, this.groupMappingsDirty),
        error: (error) => this.alerts.error(this.errorMessage(error)),
      });
  }

  private applyOverview(overview: LmsOverview, keepUnsavedSettings: boolean): void {
    this.link = overview.link;
    this.linkError = overview.linkError;
    if (!keepUnsavedSettings) {
      this.integration = overview.integration;
      this.courseData = null;
      this.restoreSavedAssignment();
      this.restoreSavedGroups();
      this.rememberSavedSettings();
    }
    if (!this.link) {
      return;
    }
    this.loadGradeLineItem();
    if (this.link.courseDataAvailable) {
      this.loadCourseData();
    } else {
      this.courseData = null;
    }
  }

  public get courseTitle(): string {
    return (
      this.courseData?.course.title ??
      this.link?.contextTitle ??
      this.link?.contextLabel ??
      'LMS course'
    );
  }

  public get courseLabel(): string | null {
    return this.courseData?.course.label ?? this.link?.contextLabel ?? null;
  }

  public loadCourseData(): void {
    this.loadingCourseData = true;
    this.lmsService
      .getCourseData(this.unit.id)
      .pipe(
        finalize(() => {
          this.loadingCourseData = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (courseData) => {
          this.courseData = courseData;
          this.assignments = courseData.assignments;
          this.lmsGroups = courseData.groups;
          this.reconcileLmsAssignment();
          this.reconcileLmsGroupMappings();
        },
        error: (error) => this.alerts.error(this.errorMessage(error)),
      });
  }

  public loadGradeLineItem(): void {
    this.loadingGradeLineItem = true;
    this.gradeLineItemError = null;
    this.lmsService
      .getGradeLineItem(this.unit.id)
      .pipe(
        finalize(() => {
          this.loadingGradeLineItem = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (status) => (this.gradeLineItem = status),
        error: (error) => {
          this.gradeLineItem = null;
          this.gradeLineItemError = this.errorMessage(error);
        },
      });
  }

  public retryGradeLineItem(): void {
    this.retryingGradeLineItem = true;
    this.gradeLineItemError = null;
    this.lmsService
      .retryGradeLineItem(this.unit.id)
      .pipe(
        finalize(() => {
          this.retryingGradeLineItem = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (status) => {
          this.gradeLineItem = status;
          this.alerts.success('LMS grade item is ready.');
        },
        error: (error) => {
          this.gradeLineItemError = this.errorMessage(error);
          this.alerts.error(this.gradeLineItemError);
        },
      });
  }

  public unlink(): void {
    this.confirmationModal.show(
      'Unlink LMS course?',
      `This removes the link between ${this.unit.code} and ${this.courseTitle}. Student imports, extension imports and grade sync will stop working. A unit can only be linked again by launching ${this.unit.code} from the LMS.`,
      () => {
        this.unlinking = true;
        this.lmsService
          .unlink(this.unit.id)
          .pipe(
            finalize(() => {
              this.unlinking = false;
              this.changeDetector.markForCheck();
            }),
          )
          .subscribe({
            next: () => {
              this.link = null;
              this.courseData = null;
              this.gradeLineItem = null;
              this.integration.validated = false;
              this.integration.validatedAt = null;
              this.alerts.success('LMS course unlinked.');
            },
            error: (error) => this.alerts.error(this.errorMessage(error)),
          });
      },
      undefined,
      'Unlink',
    );
  }

  public previewGradeSync(): void {
    this.startGradeSync(true);
  }

  public syncGrades(): void {
    this.confirmationModal.show(
      'Send grades to the LMS?',
      `Enrolled students' OnTrack grades will be sent to the ${this.gradeLineItem?.lineItem?.label ?? 'OnTrack'} grade item in ${this.courseTitle}. Run Preview grade sync first to check each LMS student is matched to the right OnTrack student. Check in the LMS gradebook that the grade item is hidden from students unless grades are approved for release.`,
      () => this.startGradeSync(false),
      undefined,
      'Send grades',
    );
  }

  private startGradeSync(previewOnly: boolean): void {
    this.gradeSyncAction = previewOnly ? 'preview' : 'sync';
    this.lmsService
      .syncGrades(this.unit.id, previewOnly)
      .pipe(
        finalize(() => {
          this.gradeSyncAction = null;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (job) =>
          this.showImportJob(
            job,
            previewOnly ? 'Previewing LMS grade sync' : 'Sending grades to the LMS',
            previewOnly ? 'LMS Grade Sync Preview' : 'LMS Grade Sync Results',
            previewOnly,
            false,
          ),
        error: (error) => this.alerts.error(this.errorMessage(error)),
      });
  }

  public save(): void {
    if (!this.groupMappingsValid) {
      this.alerts.error('Complete each LMS group mapping before saving.');
      return;
    }

    this.saving = true;
    this.lmsService
      .updateSettings(this.integration)
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
          this.rememberSavedSettings();
          this.validationIssues = [];
          this.alerts.success('Group mappings saved.');
        },
        error: (error) => this.alerts.error(this.errorMessage(error)),
      });
  }

  public saveToggle(setting: LmsToggleSetting, value: boolean): void {
    const label = TOGGLE_LABELS[setting];
    this.integration[setting] = value;
    if (setting === 'fetchExtensions') {
      this.extensionImportSettingChanged(value);
    }
    this.togglesSaving.add(setting);
    this.lmsService
      .updateToggle(this.integration, setting, value)
      .pipe(
        finalize(() => {
          this.togglesSaving.delete(setting);
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (saved) => {
          this.integration.autoSyncExtensions = saved.autoSyncExtensions;
          this.integration.validated = saved.validated;
          this.integration.validatedAt = saved.validatedAt;
          this.alerts.success(`${label} turned ${value ? 'on' : 'off'}.`);
          if (setting === 'fetchExtensions' && value && this.integration.assignmentId) {
            this.revalidate();
          }
        },
        error: (error) => {
          this.integration[setting] = !value;
          this.alerts.error(`Couldn't update ${label.toLowerCase()}: ${this.errorMessage(error)}`);
        },
      });
  }

  public get needsValidation(): boolean {
    return this.integration.groupMappingEnabled || this.integration.fetchExtensions;
  }

  // Mappings need the course-data plugin's groups, so they are not applied without it
  public get groupMappingsActive(): boolean {
    return this.integration.groupMappingEnabled && !!this.link?.courseDataAvailable;
  }

  public get studentImportBlocked(): boolean {
    return (
      this.groupMappingsDirty ||
      (this.groupMappingsActive && (!this.groupMappingsValid || !this.integration.validated))
    );
  }

  public get extensionImportBlocked(): boolean {
    return (
      !!this.extensionImportAction ||
      !this.integration.assignmentId ||
      this.assignmentEditorOpen ||
      !this.integration.validated
    );
  }

  public importStudents(previewOnly: boolean): void {
    if (!previewOnly) {
      const withdrawal = this.integration.withdrawMissingStudents
        ? ' Enrolled students who are not active students in the LMS course will be withdrawn, and returning students will be re-enrolled.'
        : '';
      this.confirmationModal.show(
        'Import LMS students?',
        `Make sure ${this.courseTitle} is the intended course. Run Preview student import first and verify the student details and any group, campus, or tutorial mappings before continuing.${withdrawal}`,
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
        'Import LMS extensions?',
        `Make sure ${this.courseTitle} and assignment ${this.integration.assignmentName} (ID ${this.integration.assignmentId}) are correct. Run Preview extension import first and verify the extension dates and special consideration days before continuing.`,
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
    this.lmsService
      .importStudents(this.unit.id, previewOnly, this.integration.withdrawMissingStudents)
      .subscribe({
        next: (job) => {
          this.studentImportAction = null;
          this.showImportJob(
            job,
            previewOnly ? 'Previewing LMS student import' : 'Importing LMS students',
            previewOnly ? 'LMS Student Import Preview' : 'LMS Student Import Results',
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
    this.lmsService.importExtensions(this.unit.id, previewOnly).subscribe({
      next: (job) => {
        this.extensionImportAction = null;
        this.showImportJob(
          job,
          previewOnly ? 'Previewing LMS extension import' : 'Importing LMS extensions',
          previewOnly ? 'LMS Extension Import Preview' : 'LMS Extension Import Results',
          previewOnly,
          false,
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

  public get assignmentEditorOpen(): boolean {
    return this.editingAssignment || !this.integration.assignmentId;
  }

  public editAssignment(): void {
    this.assignmentDraftId = this.integration.assignmentId;
    this.editingAssignment = true;
  }

  public cancelAssignmentEdit(): void {
    this.editingAssignment = false;
  }

  public saveAssignment(): void {
    const assignment = this.assignments.find(({id}) => id === this.assignmentDraftId);
    if (!assignment) {
      return;
    }

    this.savingAssignment = true;
    this.lmsService
      .updateAssignment(this.integration, assignment.id, assignment.name)
      .pipe(
        finalize(() => {
          this.savingAssignment = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (saved) => {
          this.integration.assignmentId = saved.assignmentId;
          this.integration.assignmentName = saved.assignmentName;
          this.integration.validated = saved.validated;
          this.integration.validatedAt = saved.validatedAt;
          this.assignmentSyncIssue = null;
          this.editingAssignment = false;
          this.alerts.success('Portfolio assignment saved.');
          this.revalidate();
        },
        error: (error) =>
          this.alerts.error(`Couldn't save the portfolio assignment: ${this.errorMessage(error)}`),
      });
  }

  public extensionImportSettingChanged(enabled: boolean): void {
    if (!enabled) {
      this.assignmentSyncIssue = null;
    }
  }

  public get selectedAssignment(): LmsAssignment | null {
    return this.assignmentById(this.integration.assignmentId);
  }

  public assignmentById(id: number | null): LmsAssignment | null {
    return this.assignments.find((assignment) => assignment.id === id) ?? null;
  }

  public get groupMappingsNeedingAttention(): number {
    return this.integration.groupMappings.filter(
      (mapping) =>
        this.editingGroupMappings.has(mapping) || mapping.tutorialDraft || mapping.syncIssue,
    ).length;
  }

  // Opens when a mapping is being edited or needs fixing
  public get groupMappingsOpen(): boolean {
    return (
      this.groupMappingsExpanded ||
      this.groupMappingsNeedingAttention > 0 ||
      !this.integration.groupMappings.length
    );
  }

  public addGroupMapping(): void {
    const mapping = new LmsGroupMapping();
    this.integration.groupMappings.push(mapping);
    this.editingGroupMappings.add(mapping);
  }

  public prefillGroupMappings(): void {
    if (!this.courseData) {
      return;
    }

    this.prefilling = true;
    this.lmsService
      .prefillGroupMappings(this.unit.id, this.courseData.groups)
      .pipe(
        finalize(() => {
          this.prefilling = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (result) => {
          const existingIds = new Set(
            this.integration.groupMappings.map((mapping) => mapping.lmsGroupId),
          );
          this.integration.groupMappings.push(
            ...result.groupMappings.filter((mapping) => !existingIds.has(mapping.lmsGroupId)),
          );
          this.integration.groupMappingEnabled = true;
          this.alerts.success('LMS group mappings pre-filled.');
        },
        error: (error) => this.alerts.error(this.errorMessage(error)),
      });
  }

  public validateIntegration(): void {
    this.validatingIntegration = true;
    this.lmsService
      .validateIntegration(this.unit.id)
      .pipe(
        finalize(() => {
          this.validatingIntegration = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (result) => this.applyValidationResult(result),
        error: (error) => {
          this.integration.validated = false;
          this.integration.validatedAt = null;
          this.validationIssues = [this.errorMessage(error)];
          this.alerts.error(this.errorMessage(error));
        },
      });
  }

  // Unsaved mapping edits would be validated against the saved mappings, so wait for a save
  private revalidate(): void {
    if (!this.integration.validated && !this.groupMappingsDirty && !this.validatingIntegration) {
      this.validateIntegration();
    }
  }

  public removeGroupMapping(index: number): void {
    this.editingGroupMappings.delete(this.integration.groupMappings[index]);
    this.integration.groupMappings.splice(index, 1);
    this.updateDuplicateMappingNotices();
  }

  public editGroupMapping(mapping: LmsGroupMapping): void {
    this.editingGroupMappings.add(mapping);
  }

  public finishGroupMappingEdit(mapping: LmsGroupMapping): void {
    if (!this.groupMappingValid(mapping)) {
      this.alerts.error('Complete this LMS group mapping before finishing editing.');
      return;
    }
    mapping.syncIssue = undefined;
    this.editingGroupMappings.delete(mapping);
  }

  public groupMappingEditing(mapping: LmsGroupMapping): boolean {
    return this.editingGroupMappings.has(mapping);
  }

  public lmsGroupSelected(mapping: LmsGroupMapping): void {
    mapping.lmsGroupName =
      this.lmsGroups.find((group) => group.id === mapping.lmsGroupId)?.name ?? '';
    this.updateDuplicateMappingNotices();
  }

  public targetTypeSelected(mapping: LmsGroupMapping): void {
    mapping.groupSetId = null;
    mapping.groupId = null;
    mapping.campusId = null;
    mapping.tutorialStreamId = null;
    mapping.tutorialId = null;
    mapping.createIfMissing = false;
    mapping.createTutorialIfMissing = false;
    mapping.tutorialDraft = undefined;
  }

  public groupSetSelected(mapping: LmsGroupMapping): void {
    mapping.groupId = null;
  }

  public tutorialStreamSelected(mapping: LmsGroupMapping): void {
    mapping.tutorialId = null;
  }

  public createIfMissingChanged(mapping: LmsGroupMapping): void {
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
    mapping: LmsGroupMapping,
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

  public selectedTutorial(mapping: LmsGroupMapping): Tutorial | undefined {
    return this.unit.tutorials.find((tutorial) => tutorial.id === mapping.tutorialId);
  }

  public selectedTutorialStream(mapping: LmsGroupMapping): string {
    return (
      this.unit.tutorialStreams.find((stream) => stream.id === mapping.tutorialStreamId)
        ?.description ?? 'Stream not selected'
    );
  }

  public targetTypeLabel(mapping: LmsGroupMapping): string {
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

  public selectedTargetLabel(mapping: LmsGroupMapping): string {
    if (mapping.targetType === 'campus') {
      return this.campuses.find((campus) => campus.id === mapping.campusId)?.name ?? 'Not selected';
    }
    if (mapping.targetType === 'group') {
      const groupSet = this.unit.groupSets.find((item) => item.id === mapping.groupSetId);
      if (mapping.createIfMissing) {
        return groupSet ? `${groupSet.name} · Create ${mapping.lmsGroupName}` : 'Not selected';
      }
      return groupSet?.groups.find((group) => group.id === mapping.groupId)?.name ?? 'Not selected';
    }
    return '';
  }

  public tutorialDraftValid(mapping: LmsGroupMapping): boolean {
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

  /**
   * Switches a tutorial mapping to creating a new tutorial, pre-filled from institution settings
   * when they can read the LMS group name.
   */
  public startTutorialDraft(mapping: LmsGroupMapping): void {
    if (!mapping.lmsGroupId) {
      this.alerts.error('Select an LMS group first.');
      return;
    }

    const fallbackDraft = {
      abbreviation: mapping.lmsGroupName,
      campusId: null,
      tutorialStreamId: mapping.tutorialStreamId,
      meetingLocation: '',
      meetingDay: '',
      meetingTime: '',
      capacity: null,
      tutorId: null,
    };

    this.preparingTutorialDrafts.add(mapping);
    this.lmsService
      .prefillGroupMappings(this.unit.id, [{id: mapping.lmsGroupId, name: mapping.lmsGroupName}])
      .pipe(
        finalize(() => {
          this.preparingTutorialDrafts.delete(mapping);
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (result) => {
          const suggestion = result.groupMappings[0]?.tutorialDraft;
          mapping.tutorialId = null;
          mapping.tutorialDraft = suggestion
            ? {
                ...suggestion,
                tutorialStreamId: suggestion.tutorialStreamId ?? mapping.tutorialStreamId,
              }
            : fallbackDraft;
        },
        error: () => {
          mapping.tutorialId = null;
          mapping.tutorialDraft = fallbackDraft;
        },
      });
  }

  public cancelTutorialDraft(mapping: LmsGroupMapping): void {
    mapping.tutorialDraft = undefined;
    this.editingGroupMappings.add(mapping);
  }

  public createTutorial(mapping: LmsGroupMapping): void {
    const draft = mapping.tutorialDraft;
    if (!draft || !mapping.lmsGroupId || !this.tutorialDraftValid(mapping)) {
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

    this.creatingTutorials.add(mapping.lmsGroupId);
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
          this.creatingTutorials.delete(mapping.lmsGroupId);
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

  public groupMappingValid(mapping: LmsGroupMapping): boolean {
    if (!mapping.lmsGroupId || !mapping.lmsGroupName || !mapping.targetType) {
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

  // Toggles and the assignment save on their own, so only mapping edits can be unsaved
  public get groupMappingsDirty(): boolean {
    return JSON.stringify(this.integration.groupMappings) !== this.savedGroupMappings;
  }

  private rememberSavedSettings(): void {
    this.savedGroupMappings = JSON.stringify(this.integration.groupMappings);
  }

  private restoreSavedAssignment(): void {
    if (this.integration.assignmentId && this.integration.assignmentName) {
      this.assignments = [
        {
          id: this.integration.assignmentId,
          name: this.integration.assignmentName,
          dueDate: 0,
        },
      ];
    }
  }

  private restoreSavedGroups(): void {
    this.lmsGroups = this.integration.groupMappings.map((mapping) => ({
      id: mapping.lmsGroupId,
      name: mapping.lmsGroupName,
    }));
    this.updateDuplicateMappingNotices();
  }

  private reconcileLmsAssignment(): void {
    if (!this.integration.fetchExtensions || !this.integration.assignmentId) {
      return;
    }

    const selectedId = this.integration.assignmentId;
    const selectedName = this.integration.assignmentName;
    const liveAssignment = this.assignments.find((assignment) => assignment.id === selectedId);
    if (!liveAssignment) {
      this.assignmentSyncIssue = `The LMS assignment “${selectedName}” no longer exists. Select another assignment.`;
    } else if (liveAssignment.name !== selectedName) {
      this.assignmentSyncIssue = `The LMS assignment was renamed from “${selectedName}” to “${liveAssignment.name}”. Select it again to confirm the change.`;
    } else {
      this.assignmentSyncIssue = null;
      return;
    }

    this.integration.assignmentId = null;
    this.integration.assignmentName = null;
    this.integration.validated = false;
    this.integration.validatedAt = null;
  }

  private reconcileLmsGroupMappings(): void {
    if (!this.courseData) {
      return;
    }

    const liveGroups = new Map(this.courseData.groups.map((group) => [group.id, group]));
    const knownGroupIds: Set<number> = new Set();

    for (const mapping of this.integration.groupMappings) {
      const groupId = mapping.lmsGroupId ?? mapping.syncIssue?.previousLmsGroupId;
      if (!groupId) {
        continue;
      }

      knownGroupIds.add(groupId);
      const liveGroup = liveGroups.get(groupId);
      if (!liveGroup) {
        this.integration.validated = false;
        this.integration.validatedAt = null;
        if (mapping.syncIssue?.kind !== 'deleted') {
          const previousName = mapping.lmsGroupName;
          mapping.syncIssue = {
            kind: 'deleted',
            message: `The LMS group “${previousName}” no longer exists. Select another LMS group or delete this mapping.`,
            previousLmsGroupId: groupId,
          };
          mapping.lmsGroupId = null;
        }
        this.editingGroupMappings.add(mapping);
        continue;
      }

      if (mapping.lmsGroupId === null) {
        mapping.lmsGroupId = liveGroup.id;
        mapping.syncIssue = {
          kind: 'added',
          message: `The LMS group “${liveGroup.name}” is available again. Review and confirm this mapping.`,
        };
        this.editingGroupMappings.add(mapping);
      }
      if (mapping.lmsGroupName !== liveGroup.name) {
        this.integration.validated = false;
        this.integration.validatedAt = null;
        const previousName = mapping.lmsGroupName;
        mapping.lmsGroupName = liveGroup.name;
        mapping.syncIssue = {
          kind: 'renamed',
          message: `This LMS group was renamed from “${previousName}” to “${liveGroup.name}”. Review and confirm this mapping.`,
        };
        this.editingGroupMappings.add(mapping);
      }
    }

    // Only prompt for new groups once mapping is in use, so plain student imports stay quiet.
    if (!this.integration.groupMappingEnabled) {
      return;
    }

    const missingGroups = this.courseData.groups.filter((group) => !knownGroupIds.has(group.id));
    if (!missingGroups.length) {
      return;
    }

    this.prefilling = true;
    this.lmsService
      .prefillGroupMappings(this.unit.id, missingGroups)
      .pipe(
        finalize(() => {
          this.prefilling = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (result) => this.addNewLmsGroupMappings(result.groupMappings),
        error: (error) => {
          const mappings = missingGroups.map((group) => {
            const mapping = new LmsGroupMapping();
            mapping.lmsGroupId = group.id;
            mapping.lmsGroupName = group.name;
            return mapping;
          });
          this.addNewLmsGroupMappings(mappings);
          this.alerts.error(
            `New LMS groups were added for manual mapping, but automatic pre-fill failed: ${this.errorMessage(error)}`,
          );
        },
      });
  }

  private addNewLmsGroupMappings(mappings: LmsGroupMapping[]): void {
    this.integration.validated = false;
    this.integration.validatedAt = null;
    for (const mapping of mappings) {
      mapping.syncIssue = {
        kind: 'added',
        message: `The LMS group “${mapping.lmsGroupName}” is new. Review and confirm this mapping.`,
      };
      this.integration.groupMappings.push(mapping);
      this.editingGroupMappings.add(mapping);
    }
    this.integration.groupMappingEnabled = true;
    this.updateDuplicateMappingNotices();
  }

  private applyValidationResult(result: LmsIntegrationValidationResult): void {
    this.integration.validated = result.valid;
    this.integration.validatedAt = result.validated_at;
    this.validationIssues = result.valid ? [] : result.issues.map((issue) => issue.message);
    if (this.courseData && this.integration.groupMappingEnabled) {
      this.courseData.groups = result.groups;
      this.lmsGroups = result.groups;
      this.reconcileLmsGroupMappings();
    }
    if (this.integration.fetchExtensions) {
      this.assignments = result.assignments.map((assignment) => ({
        id: assignment.id,
        name: assignment.name,
        dueDate: assignment.due_date,
      }));
      this.reconcileLmsAssignment();
    }
    const assignmentIssue = result.issues.find((item) => item.type.startsWith('assignment_'));
    if (assignmentIssue && !this.assignmentSyncIssue) {
      this.assignmentSyncIssue = assignmentIssue.message;
    }
    this.updateDuplicateMappingNotices();
    for (const issue of result.issues.filter((item) => item.type === 'group_invalid')) {
      const mapping = this.integration.groupMappings.find(
        (item) => item.lmsGroupId === issue.lms_group_id,
      );
      if (mapping) {
        mapping.syncIssue = {kind: 'invalid', message: issue.message};
        this.editingGroupMappings.add(mapping);
      }
    }
    if (result.valid) {
      this.alerts.success('LMS integration is valid.');
    } else {
      this.alerts.error(
        'LMS integration requires review. Resolve the highlighted settings, save, and validate again.',
      );
    }
  }

  private showImportJob(
    job: SidekiqJob,
    progressTitle: string,
    resultTitle: string,
    previewOnly: boolean,
    refreshStudents: boolean,
  ): void {
    if (!job?.id) {
      this.alerts.error('Failed to start LMS job.');
      return;
    }

    this.sidekiqProgressModal.show(progressTitle, job.id).subscribe({
      next: (completedJob) => {
        const result = JSON.parse(completedJob.result) as CsvResult;
        this.csvResultModal.show(
          resultTitle,
          result,
          previewOnly ? 'Preview complete' : 'Complete',
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

  private updateDuplicateMappingNotices(): void {
    const mappingsByGroup: Map<number, LmsGroupMapping[]> = new Map();
    for (const mapping of this.integration.groupMappings) {
      mapping.duplicateNotice = undefined;
      if (!mapping.lmsGroupId) {
        continue;
      }
      const mappings = mappingsByGroup.get(mapping.lmsGroupId) ?? [];
      mappings.push(mapping);
      mappingsByGroup.set(mapping.lmsGroupId, mappings);
    }

    for (const mappings of mappingsByGroup.values()) {
      if (mappings.length < 2) {
        continue;
      }
      const message = `This LMS group has ${mappings.length} mappings; all will be applied.`;
      mappings.forEach((mapping) => (mapping.duplicateNotice = message));
    }
  }

  private errorMessage(error: unknown): string {
    return errorMessage(error, 'LMS request failed.');
  }
}
