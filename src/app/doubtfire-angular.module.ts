import {interval} from 'rxjs';
import {take} from 'rxjs/operators';

import {NgModule, Injector, DoBootstrap} from '@angular/core';
import {BrowserModule, DomSanitizer, Title} from '@angular/platform-browser';
import {UpgradeModule} from '@angular/upgrade/static';
import {AppInjector, setAppInjector} from './app-injector';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Lottie animation module
// import {LottieModule, LottieCacheModule} from 'ngx-lottie';
import {provideLottieOptions, LottieComponent} from 'ngx-lottie';
import player from 'lottie-web';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatBadgeModule} from '@angular/material/badge';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSliderModule} from '@angular/material/slider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatStepperModule} from '@angular/material/stepper';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatChipListbox, MatChipsModule} from '@angular/material/chips';
import {MatGridListModule} from '@angular/material/grid-list';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {UIRouterUpgradeModule} from '@uirouter/angular-hybrid';
import {MatDialogModule as MatDialogModuleNew} from '@angular/material/dialog';
import {AlertService} from 'src/app/common/services/alert.service';
import {AlertComponent} from 'src/app/common/services/alert.service';
import {MatSidenavModule} from '@angular/material/sidenav';

import {setTheme} from 'ngx-bootstrap/utils';

import {CodeEditorModule} from '@ngstack/code-editor';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';

import {AboutDoubtfireModalService} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service';
import {
  D2lUnitDetailsFormComponent,
  D2lUnitDetailsModal,
} from './units/states/edit/directives/unit-details-editor/d2l-details-form/d2l-unit-details-form.component';
import {
  AboutDoubtfireModal,
  AboutDoubtfireModalContent,
} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {FTaskBadgeComponent} from 'src/app/common/task-badge/task-badge.component';
import {DoubtfireAngularJSModule} from 'src/app/doubtfire-angularjs.module';
import {HttpAuthenticationInterceptor} from './common/services/http-authentication.interceptor';
import {
  visualisationsProvider,
  analyticsServiceProvider,
  dateServiceProvider,
  CsvUploadModalProvider,
  UnitStudentEnrolmentModalProvider,
  CsvResultModalProvider,
  AudioRecorderProvider,
  AudioRecorderServiceProvider,
  commentsModalProvider,
  plagiarismReportModalProvider,
  rootScopeProvider,
  aboutDoubtfireModalProvider,
  calendarModalProvider,
  gradeTaskModalProvider,
  uploadSubmissionModalProvider,
  ConfirmationModalProvider,
} from './ajs-upgraded-providers';
import {
  TaskCommentComposerComponent,
  DiscussionComposerDialog,
} from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AudioCommentRecorderComponent} from './common/audio-recorder/audio/audio-comment-recorder/audio-comment-recorder';
import {DiscussionPromptComposerComponent} from './tasks/task-comment-composer/discussion-prompt-composer/discussion-prompt-composer.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {
  IntelligentDiscussionPlayerComponent,
  IntelligentDiscussionDialog,
} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import {MicrophoneTesterComponent} from './common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import {IntelligentDiscussionRecorderComponent} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-recorder/intelligent-discussion-recorder.component';
import {FlexLayoutModule} from 'ng-flex-layout';
import {ExtensionCommentComponent} from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import {CampusListComponent} from './admin/institution-settings/campuses/campus-list/campus-list.component';
import {ExtensionModalComponent} from './common/modals/extension-modal/extension-modal.component';
import {CalendarModalComponent} from './common/modals/calendar-modal/calendar-modal.component';
import {CommentsModalComponent} from './common/modals/comments-modal/comments-modal.component';
import {ConfirmationModalComponent} from './common/modals/confirmation-modal/confirmation-modal.component';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatOptionModule,
} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {DateFnsAdapter, MAT_DATE_FNS_FORMATS} from '@angular/material-date-fns-adapter';
import {enAU} from 'date-fns/locale';
import {CalendarModule, DateAdapter as CalendarDateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';

import {doubtfireStates} from './doubtfire.states';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSortModule} from '@angular/material/sort';
import {ActivityTypeListComponent} from './admin/institution-settings/activity-type-list/activity-type-list.component';
import {UnitStudentsEditorComponent} from './units/states/edit/directives/unit-students-editor/unit-students-editor.component';
import {InstitutionSettingsComponent} from './admin/institution-settings/institution-settings.component';
import {UnitTutorialsListComponent} from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import {UnitTutorialsManagerComponent} from './units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component';
import {CommentBubbleActionComponent} from './tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component';
import {StudentTutorialSelectComponent} from './units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';
import {StudentCampusSelectComponent} from './units/states/edit/directives/unit-students-editor/student-campus-select/student-campus-select.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from 'src/environments/environment';
import {PickerModule} from '@ctrl/ngx-emoji-mart';
import {EmojiModule} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {EmojiService} from './common/services/emoji.service';
import {TaskListItemComponent} from './projects/states/dashboard/directives/student-task-list/task-list-item/task-list-item.component';
import {CreatePortfolioTaskListItemComponent} from './projects/states/dashboard/directives/student-task-list/create-portfolio-task-list-item/create-portfolio-task-list-item.component';
import {TaskDescriptionCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.component';
import {TaskCommentsViewerComponent} from './tasks/task-comments-viewer/task-comments-viewer.component';
import {MarkedPipe} from './common/pipes/marked.pipe';
import {UserIconComponent} from './common/user-icon/user-icon.component';
import {AudioPlayerComponent} from './common/audio-player/audio-player.component';
import {HumanizedDatePipe} from './common/pipes/humanized-date.pipe';
import {DragDropDirective} from './common/directives/drag-drop.directive';
import {fPdfViewerComponent} from './common/pdf-viewer/pdf-viewer.component';
import {SafePipe} from './common/pipes/safe.pipe';
import {PdfViewerPanelComponent} from './common/pdf-viewer-panel/pdf-viewer-panel.component';
import {StaffTaskListComponent} from './units/states/tasks/inbox/directives/staff-task-list/staff-task-list.component';
import {FiltersPipe} from './common/filters/filters.pipe';
import {TasksOfTaskDefinitionPipe} from './common/filters/tasks-of-task-definition.pipe';
import {TasksInTutorialsPipe} from './common/filters/tasks-in-tutorials.pipe';
import {TasksForInboxSearchPipe} from './common/filters/tasks-for-inbox-search.pipe';
import {StatusIconComponent} from './common/status-icon/status-icon.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CheckForUpdateService} from './sessions/service-worker-updater/check-for-update.service';
import {
  ActivityTypeService,
  CampusService,
  AuthenticationService,
  GroupSetService,
  OverseerImageService,
  OverseerAssessmentService,
  TaskCommentService,
  TeachingPeriodService,
  TeachingPeriodBreakService,
  TutorialService,
  TutorialStreamService,
  UnitService,
  TaskService,
  ProjectService,
  UnitRoleService,
  UserService,
  WebcalService,
  LearningOutcomeService,
  TaskSimilarityService,
  D2lAssessmentMappingService,
} from './api/models/doubtfire-model';
import {FileDownloaderService} from './common/file-downloader/file-downloader.service';
import {PdfImageCommentComponent} from './tasks/task-comments-viewer/pdf-image-comment/pdf-image-comment.component';
import {OverseerImageListComponent} from './admin/institution-settings/overseer-images/overseer-image-list.component';

import {TaskAssessmentCommentComponent} from './tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component';
import {TaskAssessmentModalComponent} from './common/modals/task-assessment-modal/task-assessment-modal.component';

import {TaskSubmissionHistoryComponent} from './tasks/task-submission-history/task-submission-history.component';
import {HomeComponent} from './home/states/home/home.component';
import {IsActiveUnitRole} from './common/pipes/is-active-unit-role.pipe';
import {GradeIconComponent} from './common/grade-icon/grade-icon.component';
import {HeaderComponent} from './common/header/header.component';
import {UnitDropdownComponent} from './common/header/unit-dropdown/unit-dropdown.component';
import {TaskDropdownComponent} from './common/header/task-dropdown/task-dropdown.component';
import {SplashScreenComponent} from './home/splash-screen/splash-screen.component';
import {HttpErrorInterceptor} from './common/services/http-error.interceptor';
import {TaskDefinitionService} from './api/services/task-definition.service';
import {NewTeachingPeriodDialogComponent} from './admin/states/teaching-periods/teaching-period-list/teaching-period-list.component';
import {MatNativeDateModule} from '@angular/material/core';
import {TaskOutcomeAlignmentService} from './api/services/task-outcome-alignment.service';
import {GroupService} from './api/services/group.service';
import {ObjectSelectComponent} from './common/obect-select/object-select.component';
import {WelcomeComponent} from './welcome/welcome.component';
import {HeroSidebarComponent} from './common/hero-sidebar/hero-sidebar.component';
import {SignInComponent} from './sessions/states/sign-in/sign-in.component';
import {EditProfileFormComponent} from './common/edit-profile-form/edit-profile-form.component';
import {TransitionHooksService} from './sessions/transition-hooks.service';
import {EditProfileComponent} from './account/edit-profile/edit-profile.component';
import {UserBadgeComponent} from './common/user-badge/user-badge.component';
import {TaskStatusCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.component';
import {TaskDueCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.component';
import {FooterComponent} from './common/footer/footer.component';
import {TaskAssessmentCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.component';
import {TaskSubmissionCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.component';
import {TaskDashboardComponent} from './projects/states/dashboard/directives/task-dashboard/task-dashboard.component';
import {InboxComponent} from './units/states/tasks/inbox/inbox.component';
import {ProjectProgressBarComponent} from './common/project-progress-bar/project-progress-bar.component';
import {TeachingPeriodListComponent} from './admin/states/teaching-periods/teaching-period-list/teaching-period-list.component';
import {FChipComponent} from './common/f-chip/f-chip.component';
import {TaskSimilarityViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-similarity-view/task-similarity-view.component';
import {FileViewerComponent} from './common/file-viewer/file-viewer.component';
import {TaskDefinitionEditorComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-editor.component';
import {TaskDefinitionGeneralComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-general/task-definition-general.component';
import {TaskDefinitionWhoComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-who/task-definition-who.component';
import {TaskDefinitionDatesComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-dates/task-definition-dates.component';
import {TaskDefinitionUploadComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-upload/task-definition-upload.component';
import {TaskDefinitionOptionsComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-options/task-definition-options.component';
import {TaskDefinitionResourcesComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-resources/task-definition-resources.component';
import {TaskDefinitionOverseerComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-overseer/task-definition-overseer.component';
import {TaskDefinitionScormComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-scorm/task-definition-scorm.component';
import {UnitAnalyticsComponent} from './units/states/analytics/unit-analytics-route.component';
import {FileDropComponent} from './common/file-drop/file-drop.component';
import {UnitTaskEditorComponent} from './units/states/edit/directives/unit-tasks-editor/unit-task-editor.component';
import {FUsersComponent} from './admin/states/f-users/f-users.component';

import {CreateNewUnitModal} from './admin/modals/create-new-unit-modal/create-new-unit-modal.component';
import {CreateNewUnitModalContentComponent} from './admin/modals/create-new-unit-modal/create-new-unit-modal-content.component';
import {
  TeachingPeriodUnitImportDialogComponent,
  TeachingPeriodUnitImportService,
} from './admin/states/teaching-periods/teaching-period-unit-import/teaching-period-unit-import.dialog';
import {AcceptEulaComponent} from './eula/accept-eula/accept-eula.component';
import {TiiActionLogComponent} from './admin/tii-action-log/tii-action-log.component';
import {TiiActionService} from './api/services/tii-action.service';
import {FUnitsComponent} from './admin/states/f-units/f-units.component';
import {FUnitTaskListComponent} from './units/states/tasks/viewer/directives/f-unit-task-list/f-unit-task-list.component';
import {FTaskDetailsViewComponent} from './units/states/tasks/viewer/directives/f-task-details-view/f-task-details-view.component';
import {FTaskSheetViewComponent} from './units/states/tasks/viewer/directives/f-task-sheet-view/f-task-sheet-view.component';
import {TasksViewerComponent} from './units/states/tasks/tasks-viewer/tasks-viewer.component';
import {UnitCodeComponent} from './common/unit-code/unit-code.component';
import {GradeService} from './common/services/grade.service';
import {ScormPlayerComponent} from './common/scorm-player/scorm-player.component';
import {ScormAdapterService} from './api/services/scorm-adapter.service';
import {ScormCommentComponent} from './tasks/task-comments-viewer/scorm-comment/scorm-comment.component';
import {TaskScormCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-scorm-card/task-scorm-card.component';
import {TestAttemptService} from './api/services/test-attempt.service';
import {ScormExtensionCommentComponent} from './tasks/task-comments-viewer/scorm-extension-comment/scorm-extension-comment.component';
import {ScormExtensionModalComponent} from './common/modals/scorm-extension-modal/scorm-extension-modal.component';
import {
  D2lTransferComponent,
  D2lTransferModal,
} from './units/states/portfolios/d2l-transfer-modal/d2l-transfer.component';
import {SuccessCloseComponent} from './common/success-close/success-close.component';
import {FeedbackTemplateService} from './api/services/feedback-template.service';
import {FeedbackTemplateEditorComponent} from './common/feedback-template-editor/feedback-template-editor.component';
import {LearningOutcomeEditorComponent} from './common/learning-outcome-editor/learning-outcome-editor.component';
import {TaskFeedbackTemplatesComponent} from './tasks/task-comment-composer/task-feedback-templates/task-feedback-templates.component';
import {NestedCsvDownloadModalComponent} from './common/learning-outcome-editor/nested-csv-download-modal/nested-csv-download-modal.component';
import {NestedCsvDownloadModalService} from './common/learning-outcome-editor/nested-csv-download-modal/nested-csv-download-modal.service';
import {TutorDiscussionComponent} from './projects/states/tutor-discussion/tutor-discussion.component';
import {QrModalComponent} from './common/modals/qr-modal/qr-modal.component';
import {TaskIlosCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-ilos-card/task-ilos-card.component';
import {TaskDateSliderComponent} from './common/modals/date-change-modal/task-date-slider.component';
import {SpecConModalComponent} from './common/modals/spec-con-modal/spec-con-modal.component';
import {SpecConModalService} from './common/modals/spec-con-modal/spec-con-modal.service';
import {ProjectPlanComponent} from './projects/states/plan/project-plan.component';
import {JplagReportViewerComponent} from './projects/states/jplag/jplag-report-viewer.component';
import {StaffNotesComponent} from './projects/states/staff-notes/staff-notes.component';
import {StaffNoteService} from './api/services/staff-note.service';
import {LocalizedDatePipe} from './common/pipes/localized-date.pipe';
import {StaffNotesViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/staff-notes-view/staff-notes-view.component';
import {SubmissionTypeModalComponent} from './tasks/modals/submission-type-modal/submission-type-modal.component';
import {SidekiqProgressModalComponent} from './common/modals/sidekiq-progress-modal/sidekiq-progress-modal.component';
import {SidekiqJobsModalComponent} from './common/modals/sidekiq-jobs-modal/sidekiq-jobs-modal.component';
import {SidekiqJobService} from './api/services/sidekiq-job.service';
import {UnavailableCardComponent} from './errors/unavailable-card/unavailable-card.component';
import {LtiDashboardComponent} from './home/states/lti-dashboard/lti-dashboard.component';
import {LtiUnitLinkComponent} from './home/states/lti-unit-link/lti-unit-link.component';
import {LtiService} from './api/services/lti.service';
import {TaskDefinitionPrerequisitesComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-prerequisites/task-definition-prerequisites.component';
import {TaskPrerequisitesCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-prerequisites-card/task-prerequisites-card.component';
import {TaskPrerequisiteService} from './api/services/task-prerequisite.service';
// import {GradeTaskModalComponent} from './tasks/modals/grade-task-modal/grade-task-modal.component';
// import {PrivacyPolicy} from './config/privacy-policy/privacy-policy';
import {UnitStaffEditorComponent} from './units/states/edit/directives/unit-staff-editor/unit-staff-editor.component';
import {GroupSetSelectorComponent} from './groups/group-set-selector/group-set-selector.component';
import {UnitDetailsEditorComponent} from './units/states/edit/directives/unit-details-editor/unit-details-editor.component';
import {PortfolioGradeSelectStepComponent} from './projects/states/portfolio/directives/portfolio-grade-select-step/portfolio-grade-select-step.component';
import {AnalyticsTutorTimesComponent} from './units/states/analytics/directives/analytics-tutor-times.component';
import {MarkingSessionService} from './api/services/marking-session.service';
import {PortfolioIncludedTasksComponent} from './projects/states/portfolio/directives/portfolio-review-step/portfolio-included-tasks/portfolio-included-tasks.component';
import {OverseerScriptEditorModalComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-overseer/overseer-script-editor-modal/overseer-script-editor-modal.component';
import {UploadGradesComponent} from './units/states/portfolios/upload-grades/upload-grades.component';
import {GANTT_GLOBAL_CONFIG, GanttLinkLineType, NgxGanttModule} from '@worktile/gantt';
import {DiscussionPromptService} from './api/services/discussion-prompt.service';
import {DiscussionPromptsComponent} from './projects/states/discussion-prompts/discussion-prompts.component';
import {TaskDefinitionDiscussionPromptsComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-discussion-prompts/task-definition-discussion-prompts.component';
import {DiscussionPromptsViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/discussion-prompts-view/discussion-prompts-view.component';
import {DownloadStaffNotesComponent} from './units/states/portfolios/download-staff-notes/download-staff-notes.component';
import {TaskPlannerComponent} from './projects/states/plan/task-planner/task-planner.component';
import {TaskPlannerPrerequisitesModalComponent} from './projects/states/plan/task-planner/task-planner-prerequisites-modal/task-planner-prerequisites-modal.component';
import {TaskPlannerPrerequisitesModalService} from './projects/states/plan/task-planner/task-planner-prerequisites-modal/task-planner-prerequisites-modal.service';
import {TaskPlannerCardComponent} from './projects/states/dashboard/directives/progress-dashboard/task-planner-card/task-planner-card.component';
import {OverseerStepService} from './api/services/overseer-step.service';
import {TaskOverseerReportComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-overseer-report/task-overseer-report.component';
import {OverseerStepResultService} from './api/services/overseer-step-result.service';
import {TutorNotesComponent} from './projects/states/tutor-notes/tutor-notes.component';
import {TutorNotesViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/tutor-notes-view/tutor-notes-view.component';
import {TutorNoteService} from './api/services/tutor-note.service';
import {ModerationComponent} from './units/states/tasks/inbox/directives/moderation/moderation.component';
import {TutorNotesModalComponent} from './common/modals/tutor-notes-modal/tutor-notes-modal.component';

// See https://stackoverflow.com/questions/55721254/how-to-change-mat-datepicker-date-format-to-dd-mm-yyyy-in-simplest-way/58189036#58189036
const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'dd/MM/yyyy', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'dd/MM/yyyy', // this is how your date will get displayed on the Input
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'do MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

const GANTT_CHART_CONFIG = {
  provide: GANTT_GLOBAL_CONFIG,
  useValue: {
    // locale: 'en-US',
    dateFormat: {
      // timeZone: 'UTC',
      weekStartsOn: 1,
      week: 'w',
      year: 'yyyy',
      month: 'MMMM',
      yearMonth: 'yyyy MMM',
      yearQuarter: 'yyyy',
    },
    linkOptions: {
      showArrow: true,
      lineType: GanttLinkLineType.curve,
    },
    styleOptions: {
      // lineHeight: '25',
      // barHeight: '23',
      // headerHeight: '50px',
    },
  },
};

@NgModule({
  // Components we declare
  declarations: [
    AlertComponent,
    AboutDoubtfireModalContent,
    D2lUnitDetailsFormComponent,
    D2lTransferComponent,
    TeachingPeriodUnitImportDialogComponent,
    TaskCommentComposerComponent,
    AudioCommentRecorderComponent,
    MicrophoneTesterComponent,
    DiscussionPromptComposerComponent,
    IntelligentDiscussionPlayerComponent,
    TaskDateSliderComponent,
    IntelligentDiscussionDialog,
    DiscussionComposerDialog,
    IntelligentDiscussionRecorderComponent,
    ExtensionCommentComponent,
    PdfImageCommentComponent,
    CampusListComponent,
    ActivityTypeListComponent,
    OverseerImageListComponent,
    ExtensionModalComponent,
    SpecConModalComponent,
    CalendarModalComponent,
    ConfirmationModalComponent,
    InstitutionSettingsComponent,
    ProjectPlanComponent,
    SuccessCloseComponent,
    HomeComponent,
    CommentBubbleActionComponent,
    UnitTutorialsListComponent,
    UnitTutorialsManagerComponent,
    FileDropComponent,
    UnitStudentsEditorComponent,
    UnitTaskEditorComponent,
    TaskDefinitionEditorComponent,
    TaskDefinitionGeneralComponent,
    TaskDefinitionWhoComponent,
    TaskDefinitionDatesComponent,
    TaskDefinitionUploadComponent,
    TaskDefinitionOptionsComponent,
    TaskDefinitionResourcesComponent,
    TaskDefinitionOverseerComponent,
    TaskDefinitionScormComponent,
    UnitAnalyticsComponent,
    StudentTutorialSelectComponent,
    StudentCampusSelectComponent,
    TaskListItemComponent,
    CreatePortfolioTaskListItemComponent,
    TaskDescriptionCardComponent,
    StatusIconComponent,
    TaskCommentsViewerComponent,
    UserIconComponent,
    AudioPlayerComponent,
    MarkedPipe,
    HumanizedDatePipe,
    IsActiveUnitRole,
    DragDropDirective,
    fPdfViewerComponent,
    SafePipe,
    PdfViewerPanelComponent,
    StaffTaskListComponent,
    TaskSimilarityViewComponent,
    FiltersPipe,
    TasksOfTaskDefinitionPipe,
    TasksInTutorialsPipe,
    TasksForInboxSearchPipe,
    StatusIconComponent,
    TaskAssessmentCommentComponent,
    TaskAssessmentModalComponent,
    TaskSubmissionHistoryComponent,
    GradeIconComponent,
    HeaderComponent,
    UnitDropdownComponent,
    TaskDropdownComponent,
    SplashScreenComponent,
    ObjectSelectComponent,
    WelcomeComponent,
    AcceptEulaComponent,
    HeroSidebarComponent,
    SignInComponent,
    EditProfileFormComponent,
    EditProfileComponent,
    UserBadgeComponent,
    TaskStatusCardComponent,
    TaskDueCardComponent,
    FooterComponent,
    TaskAssessmentCardComponent,
    TaskSubmissionCardComponent,
    TaskDashboardComponent,
    InboxComponent,
    ProjectProgressBarComponent,
    TeachingPeriodListComponent,
    CreateNewUnitModal,
    CreateNewUnitModalContentComponent,
    TiiActionLogComponent,
    FChipComponent,
    UnitCodeComponent,
    NewTeachingPeriodDialogComponent,
    FileViewerComponent,
    AlertComponent,
    FUnitTaskListComponent,
    FTaskDetailsViewComponent,
    FTaskSheetViewComponent,
    TasksViewerComponent,
    FUsersComponent,
    FTaskBadgeComponent,
    FUnitsComponent,
    CommentsModalComponent,
    ScormPlayerComponent,
    ScormCommentComponent,
    TaskScormCardComponent,
    ScormExtensionCommentComponent,
    ScormExtensionModalComponent,
    FeedbackTemplateEditorComponent,
    LearningOutcomeEditorComponent,
    TaskFeedbackTemplatesComponent,
    NestedCsvDownloadModalComponent,
    TutorDiscussionComponent,
    TaskIlosCardComponent,
    JplagReportViewerComponent,
    StaffNotesComponent,
    StaffNotesViewComponent,
    QrModalComponent,
    LocalizedDatePipe,
    SubmissionTypeModalComponent,
    SidekiqProgressModalComponent,
    SidekiqJobsModalComponent,
    UnavailableCardComponent,
    LtiDashboardComponent,
    LtiUnitLinkComponent,
    TaskDefinitionPrerequisitesComponent,
    TaskPrerequisitesCardComponent,
    UnitStaffEditorComponent,
    GroupSetSelectorComponent,
    UnitDetailsEditorComponent,
    PortfolioGradeSelectStepComponent,
    AnalyticsTutorTimesComponent,
    PortfolioIncludedTasksComponent,
    OverseerScriptEditorModalComponent,
    UploadGradesComponent,
    DiscussionPromptsComponent,
    TaskDefinitionDiscussionPromptsComponent,
    DiscussionPromptsViewComponent,
    TaskPlannerComponent,
    DownloadStaffNotesComponent,
    TaskPlannerCardComponent,
    TaskPlannerPrerequisitesModalComponent,
    TaskOverseerReportComponent,
    TutorNotesComponent,
    TutorNotesViewComponent,
    ModerationComponent,
    TutorNotesModalComponent,
  ],
  providers: [
    // Services we provide
    AlertService,
    MarkedPipe,
    CampusService,
    AuthenticationService,
    GroupSetService,
    GroupService,
    UnitService,
    D2lAssessmentMappingService,
    ProjectService,
    UnitRoleService,
    LearningOutcomeService,
    TaskDefinitionService,
    TeachingPeriodService,
    TiiActionService,
    TeachingPeriodBreakService,
    TeachingPeriodUnitImportService,
    TutorialService,
    TutorialStreamService,
    UserService,
    TaskService,
    GradeService,
    TaskSimilarityService,
    WebcalService,
    ActivityTypeService,
    OverseerImageService,
    OverseerAssessmentService,
    EmojiService,
    FileDownloaderService,
    CheckForUpdateService,
    TaskOutcomeAlignmentService,
    visualisationsProvider,
    commentsModalProvider,
    rootScopeProvider,
    calendarModalProvider,
    aboutDoubtfireModalProvider,
    uploadSubmissionModalProvider,
    gradeTaskModalProvider,
    analyticsServiceProvider,
    dateServiceProvider,
    CsvUploadModalProvider,
    CsvResultModalProvider,
    {provide: MAT_DATE_LOCALE, useValue: enAU},
    {provide: DateAdapter, useClass: DateFnsAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT},
    UnitStudentEnrolmentModalProvider,
    TaskCommentService,
    AudioRecorderProvider,
    AudioRecorderServiceProvider,
    plagiarismReportModalProvider,
    UnitStudentsEditorComponent,
    ConfirmationModalProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthenticationInterceptor,
      multi: true,
      deps: [UserService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
      deps: [AuthenticationService, UserService],
    },
    AboutDoubtfireModal,
    AboutDoubtfireModalService,
    SpecConModalService,
    DoubtfireConstants,
    TasksOfTaskDefinitionPipe,
    TasksInTutorialsPipe,
    TasksForInboxSearchPipe,
    IsActiveUnitRole,
    D2lUnitDetailsModal,
    D2lTransferModal,
    CreateNewUnitModal,
    ScormAdapterService,
    TestAttemptService,
    provideLottieOptions({
      player: () => player,
    }),
    FeedbackTemplateService,
    NestedCsvDownloadModalService,
    StaffNoteService,
    SidekiqJobService,
    LtiService,
    TaskPrerequisiteService,
    MarkingSessionService,
    DiscussionPromptService,
    GANTT_CHART_CONFIG,
    TaskPlannerPrerequisitesModalService,
    OverseerStepService,
    OverseerStepResultService,
    TutorNoteService,
  ],
  imports: [
    FlexLayoutModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ClipboardModule,
    DragDropModule,
    ScrollingModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatBadgeModule,
    MatRadioModule,
    MatListModule,
    MatOptionModule,
    MatStepperModule,
    MatPaginatorModule,
    MatSelectModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatDialogModule,
    MatSortModule,
    MatProgressBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatCardModule,
    MatGridListModule,
    MatSelectModule,
    MatToolbarModule,
    MatTabsModule,
    UpgradeModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    PickerModule,
    EmojiModule,
    PdfViewerModule,
    LottieComponent,
    UIRouterUpgradeModule.forRoot({states: doubtfireStates}),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: () => interval(6000).pipe(take(1)),
    }),
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModuleNew,
    CalendarModule.forRoot({provide: CalendarDateAdapter, useFactory: adapterFactory}),
    CodeEditorModule.forRoot(),
    NgxGanttModule,
    MatSidenavModule,
    MonacoEditorModule.forRoot(),
    MatChipListbox,
  ],
})

// There is no longer any requirement for an EntryComponents section
// since Angular 9 introduced the IVY renderer
export class DoubtfireAngularModule implements DoBootstrap {
  constructor(
    injector: Injector,
    private upgrade: UpgradeModule,
    private constants: DoubtfireConstants,
    private title: Title,
    private updater: CheckForUpdateService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    setAppInjector(injector);
    setTheme('bs3'); // or 'bs4'

    this.constants.ExternalName.subscribe((result) => {
      this.title.setTitle(result);
    });

    this.matIconRegistry.addSvgIcon(
      'formatif-logo',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/logo.svg'),
    );
  }

  ngDoBootstrap(): void {
    this.upgrade.bootstrap(document.body, [DoubtfireAngularJSModule.name], {
      strictDi: false,
    });
    AppInjector.get(TransitionHooksService);
  }
}
