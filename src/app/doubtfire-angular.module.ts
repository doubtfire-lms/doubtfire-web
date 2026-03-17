import {interval} from 'rxjs';
import {take} from 'rxjs/operators';

import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {DoBootstrap, Injector, NgModule} from '@angular/core';
import {BrowserModule, DomSanitizer, Title} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {UpgradeModule} from '@angular/upgrade/static';
import {FileUploadModule} from '@iplab/ngx-file-upload';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {AppInjector, setAppInjector} from './app-injector';

// Lottie animation module
// import {LottieModule, LottieCacheModule} from 'ngx-lottie';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipListbox, MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatStepperModule} from '@angular/material/stepper';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {UIRouterUpgradeModule} from '@uirouter/angular-hybrid';
import player from 'lottie-web';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {LottieComponent, provideLottieOptions} from 'ngx-lottie';
import {AlertComponent, AlertService} from 'src/app/common/services/alert.service';
import {ProgressDashboardComponent} from './projects/states/dashboard/directives/progress-dashboard/progress-dashboard.component';

import {setTheme} from 'ngx-bootstrap/utils';

import {CodeEditorModule} from '@ngstack/code-editor';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  AboutDoubtfireModal,
  AboutDoubtfireModalContent,
} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import {AboutDoubtfireModalService} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service';
import {FTaskBadgeComponent} from 'src/app/common/task-badge/task-badge.component';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {DoubtfireAngularJSModule} from 'src/app/doubtfire-angularjs.module';
import {
  DiscussionComposerDialog,
  TaskCommentComposerComponent,
} from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import {
  aboutDoubtfireModalProvider,
  analyticsServiceProvider,
  AudioRecorderProvider,
  AudioRecorderServiceProvider,
  calendarModalProvider,
  commentsModalProvider,
  ConfirmationModalProvider,
  dateServiceProvider,
  gradeTaskModalProvider,
  plagiarismReportModalProvider,
  rootScopeProvider,
  UnitStudentEnrolmentModalProvider,
  visualisationsProvider,
} from './ajs-upgraded-providers';
import {HttpAuthenticationInterceptor} from './common/services/http-authentication.interceptor';
import {ProjectTasksListComponent} from './tasks/project-tasks-list/project-tasks-list.component';
import {
  D2lUnitDetailsFormComponent,
  D2lUnitDetailsModal,
} from './units/states/edit/directives/unit-details-editor/d2l-details-form/d2l-unit-details-form.component';

import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatOptionModule,
} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {FlexLayoutModule} from 'ng-flex-layout';
import {CampusListComponent} from './admin/institution-settings/campuses/campus-list/campus-list.component';
import {AudioCommentRecorderComponent} from './common/audio-recorder/audio/audio-comment-recorder/audio-comment-recorder';
import {MicrophoneTesterComponent} from './common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import {CalendarModalComponent} from './common/modals/calendar-modal/calendar-modal.component';
import {CommentsModalComponent} from './common/modals/comments-modal/comments-modal.component';
import {ConfirmationModalComponent} from './common/modals/confirmation-modal/confirmation-modal.component';
import {ExtensionModalComponent} from './common/modals/extension-modal/extension-modal.component';
import {DiscussionPromptComposerComponent} from './tasks/task-comment-composer/discussion-prompt-composer/discussion-prompt-composer.component';
import {ExtensionCommentComponent} from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import {
  IntelligentDiscussionDialog,
  IntelligentDiscussionPlayerComponent,
} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import {IntelligentDiscussionRecorderComponent} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-recorder/intelligent-discussion-recorder.component';

import {DateFnsAdapter} from '@angular/material-date-fns-adapter';
import {DateAdapter as CalendarDateAdapter, CalendarModule} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {enAU} from 'date-fns/locale';

import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {ServiceWorkerModule} from '@angular/service-worker';
import {PickerModule} from '@ctrl/ngx-emoji-mart';
import {EmojiModule} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {environment} from 'src/environments/environment';
import {ActivityTypeListComponent} from './admin/institution-settings/activity-type-list/activity-type-list.component';
import {InstitutionSettingsComponent} from './admin/institution-settings/institution-settings.component';
import {OverseerImageListComponent} from './admin/institution-settings/overseer-images/overseer-image-list.component';
import {
  ActivityTypeService,
  AuthenticationService,
  CampusService,
  D2lAssessmentMappingService,
  GroupSetService,
  LearningOutcomeService,
  OverseerAssessmentService,
  OverseerImageService,
  ProjectService,
  TaskCommentService,
  TaskService,
  TaskSimilarityService,
  TeachingPeriodBreakService,
  TeachingPeriodService,
  TutorialService,
  TutorialStreamService,
  UnitRoleService,
  UnitService,
  UserService,
  WebcalService,
} from './api/models/doubtfire-model';
import {AudioPlayerComponent} from './common/audio-player/audio-player.component';
import {DragDropDirective} from './common/directives/drag-drop.directive';
import {FileDownloaderService} from './common/file-downloader/file-downloader.service';
import {FiltersPipe} from './common/filters/filters.pipe';
import {OrderByPipe} from './common/filters/order-by.pipe';
import {TasksForGroupsetPipe} from './common/filters/tasks-for-group-set.pipe';
import {TasksForInboxSearchPipe} from './common/filters/tasks-for-inbox-search.pipe';
import {TasksInTutorialsPipe} from './common/filters/tasks-in-tutorials.pipe';
import {TasksOfTaskDefinitionPipe} from './common/filters/tasks-of-task-definition.pipe';
import {PdfViewerPanelComponent} from './common/pdf-viewer-panel/pdf-viewer-panel.component';
import {fPdfViewerComponent} from './common/pdf-viewer/pdf-viewer.component';
import {HumanizedDatePipe} from './common/pipes/humanized-date.pipe';
import {MarkedPipe} from './common/pipes/marked.pipe';
import {SafePipe} from './common/pipes/safe.pipe';
import {EmojiService} from './common/services/emoji.service';
import {StatusIconComponent} from './common/status-icon/status-icon.component';
import {UserIconComponent} from './common/user-icon/user-icon.component';
import {doubtfireStates} from './doubtfire.states';
import {CreatePortfolioTaskListItemComponent} from './projects/states/dashboard/directives/student-task-list/create-portfolio-task-list-item/create-portfolio-task-list-item.component';
import {TaskListItemComponent} from './projects/states/dashboard/directives/student-task-list/task-list-item/task-list-item.component';
import {TaskDescriptionCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.component';
import {CheckForUpdateService} from './sessions/service-worker-updater/check-for-update.service';
import {CommentBubbleActionComponent} from './tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component';
import {PdfImageCommentComponent} from './tasks/task-comments-viewer/pdf-image-comment/pdf-image-comment.component';
import {TaskCommentsViewerComponent} from './tasks/task-comments-viewer/task-comments-viewer.component';
import {StudentCampusSelectComponent} from './units/states/edit/directives/unit-students-editor/student-campus-select/student-campus-select.component';
import {StudentTutorialSelectComponent} from './units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';
import {UnitStudentsEditorComponent} from './units/states/edit/directives/unit-students-editor/unit-students-editor.component';
import {UnitTutorialsListComponent} from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import {UnitTutorialsManagerComponent} from './units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component';
import {StudentsListComponent} from './units/states/students-list/students-list.component';
import {StaffTaskListComponent} from './units/states/tasks/inbox/directives/staff-task-list/staff-task-list.component';

import {TaskAssessmentModalComponent} from './common/modals/task-assessment-modal/task-assessment-modal.component';
import {TaskAssessmentCommentComponent} from './tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component';

import {MatNativeDateModule} from '@angular/material/core';
import {EditProfileComponent} from './account/edit-profile/edit-profile.component';
import {CreateNewUnitModalContentComponent} from './admin/modals/create-new-unit-modal/create-new-unit-modal-content.component';
import {CreateNewUnitModal} from './admin/modals/create-new-unit-modal/create-new-unit-modal.component';
import {
  NewTeachingPeriodDialogComponent,
  TeachingPeriodListComponent,
} from './admin/states/teaching-periods/teaching-period-list/teaching-period-list.component';
import {
  TeachingPeriodUnitImportDialogComponent,
  TeachingPeriodUnitImportService,
} from './admin/states/teaching-periods/teaching-period-unit-import/teaching-period-unit-import.dialog';
import {FUnitsComponent} from './admin/states/units/units.component';
import {FUsersComponent} from './admin/states/users/users.component';
import {TiiActionLogComponent} from './admin/tii-action-log/tii-action-log.component';
import {FeedbackTemplateService} from './api/services/feedback-template.service';
import {GroupService} from './api/services/group.service';
import {LtiService} from './api/services/lti.service';
import {ScormAdapterService} from './api/services/scorm-adapter.service';
import {SidekiqJobService} from './api/services/sidekiq-job.service';
import {StaffNoteService} from './api/services/staff-note.service';
import {TaskDefinitionService} from './api/services/task-definition.service';
import {TaskOutcomeAlignmentService} from './api/services/task-outcome-alignment.service';
import {TaskPrerequisiteService} from './api/services/task-prerequisite.service';
import {TestAttemptService} from './api/services/test-attempt.service';
import {TiiActionService} from './api/services/tii-action.service';
import {ArchiveViewerComponent} from './common/archive-viewer/archive-viewer.component';
import {ChartBaseComponent} from './common/chart-base/chart-base-component/chart-base-component.component';
import {EditProfileFormComponent} from './common/edit-profile-form/edit-profile-form.component';
import {FChipComponent} from './common/f-chip/chip.component';
import {FeedbackTemplateEditorComponent} from './common/feedback-template-editor/feedback-template-editor.component';
import {FileDropComponent} from './common/file-drop/file-drop.component';
import {FileViewerComponent} from './common/file-viewer/file-viewer.component';
import {FooterComponent} from './common/footer/footer.component';
import {GradeIconComponent} from './common/grade-icon/grade-icon.component';
import {HeaderComponent} from './common/header/header.component';
import {TaskDropdownComponent} from './common/header/task-dropdown/task-dropdown.component';
import {UnitDropdownComponent} from './common/header/unit-dropdown/unit-dropdown.component';
import {HeroSidebarComponent} from './common/hero-sidebar/hero-sidebar.component';
import {LearningOutcomeEditorComponent} from './common/learning-outcome-editor/learning-outcome-editor.component';
import {NestedCsvDownloadModalComponent} from './common/learning-outcome-editor/nested-csv-download-modal/nested-csv-download-modal.component';
import {NestedCsvDownloadModalService} from './common/learning-outcome-editor/nested-csv-download-modal/nested-csv-download-modal.service';
import {TaskDateSliderComponent} from './common/modals/date-change-modal/task-date-slider.component';
import {QrModalComponent} from './common/modals/qr-modal/qr-modal.component';
import {ScormExtensionModalComponent} from './common/modals/scorm-extension-modal/scorm-extension-modal.component';
import {SidekiqJobsModalComponent} from './common/modals/sidekiq-jobs-modal/sidekiq-jobs-modal.component';
import {SidekiqProgressModalComponent} from './common/modals/sidekiq-progress-modal/sidekiq-progress-modal.component';
import {SpecConModalComponent} from './common/modals/spec-con-modal/spec-con-modal.component';
import {SpecConModalService} from './common/modals/spec-con-modal/spec-con-modal.service';
import {ObjectSelectComponent} from './common/obect-select/object-select.component';
import {IsActiveUnitRole} from './common/pipes/is-active-unit-role.pipe';
import {LocalizedDatePipe} from './common/pipes/localized-date.pipe';
import {ProjectProgressBarComponent} from './common/project-progress-bar/project-progress-bar.component';
import {ProjectProgressGaugeComponent} from './common/project-progress/project-progress-gauge.component';
import {ScormPlayerComponent} from './common/scorm-player/scorm-player.component';
import {GradeService} from './common/services/grade.service';
import {HttpErrorInterceptor} from './common/services/http-error.interceptor';
import {SuccessCloseComponent} from './common/success-close/success-close.component';
import {UnitCodeComponent} from './common/unit-code/unit-code.component';
import {UserBadgeComponent} from './common/user-badge/user-badge.component';
import {UnauthorisedComponent} from './errors/states/unauthorised/unauthorised.component';
import {UnavailableCardComponent} from './errors/unavailable-card/unavailable-card.component';
import {AcceptEulaComponent} from './eula/accept-eula/accept-eula.component';
import {SplashScreenComponent} from './home/splash-screen/splash-screen.component';
import {HomeComponent} from './home/states/home/home.component';
import {LtiDashboardComponent} from './home/states/lti-dashboard/lti-dashboard.component';
import {LtiUnitLinkComponent} from './home/states/lti-unit-link/lti-unit-link.component';
import {ProjectProgressDashboardComponent} from './projects/project-progress-dashboard/project-progress-dashboard.component';
import {StaffNotesViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/staff-notes-view/staff-notes-view.component';
import {TaskAssessmentCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.component';
import {TaskDueCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.component';
import {TaskIlosCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-ilos-card/task-ilos-card.component';
import {TaskPrerequisitesCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-prerequisites-card/task-prerequisites-card.component';
import {TaskScormCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-scorm-card/task-scorm-card.component';
import {TaskSimilarityViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-similarity-view/task-similarity-view.component';
import {TaskStatusCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.component';
import {TaskSubmissionCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.component';
import {TaskDashboardComponent} from './projects/states/dashboard/directives/task-dashboard/task-dashboard.component';
import {ProjectDashboardComponent} from './projects/states/dashboard/project-dashboard/project-dashboard.component';
import {JplagReportViewerComponent} from './projects/states/jplag/jplag-report-viewer.component';
import {ProjectPlanComponent} from './projects/states/plan/project-plan.component';
import {ProjectRootStateComponent} from './projects/states/project-root-state.component';
import {StaffNotesComponent} from './projects/states/staff-notes/staff-notes.component';
import {TutorDiscussionComponent} from './projects/states/tutor-discussion/tutor-discussion.component';
import {SignInComponent} from './sessions/states/sign-in/sign-in.component';
import {TransitionHooksService} from './sessions/transition-hooks.service';
import {SubmissionTypeModalComponent} from './tasks/modals/submission-type-modal/submission-type-modal.component';
import {TaskFeedbackTemplatesComponent} from './tasks/task-comment-composer/task-feedback-templates/task-feedback-templates.component';
import {ScormCommentComponent} from './tasks/task-comments-viewer/scorm-comment/scorm-comment.component';
import {ScormExtensionCommentComponent} from './tasks/task-comments-viewer/scorm-extension-comment/scorm-extension-comment.component';
import {TaskSubmissionHistoryComponent} from './tasks/task-submission-history/task-submission-history.component';
import {UnitAnalyticsComponent} from './units/states/analytics/unit-analytics-route.component';
import {TaskDefinitionDatesComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-dates/task-definition-dates.component';
import {TaskDefinitionEditorComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-editor.component';
import {TaskDefinitionGeneralComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-general/task-definition-general.component';
import {TaskDefinitionOptionsComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-options/task-definition-options.component';
import {TaskDefinitionOverseerComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-overseer/task-definition-overseer.component';
import {TaskDefinitionPrerequisitesComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-prerequisites/task-definition-prerequisites.component';
import {TaskDefinitionResourcesComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-resources/task-definition-resources.component';
import {TaskDefinitionScormComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-scorm/task-definition-scorm.component';
import {TaskDefinitionUploadComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-upload/task-definition-upload.component';
import {TaskDefinitionWhoComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-who/task-definition-who.component';
import {UnitTaskEditorComponent} from './units/states/edit/directives/unit-tasks-editor/unit-task-editor.component';
import {
  D2lTransferComponent,
  D2lTransferModal,
} from './units/states/portfolios/d2l-transfer-modal/d2l-transfer.component';
import {InboxDashboardComponent} from './units/states/tasks/inbox/directives/inbox-dashboard/inbox-dashboard.component';
import {InboxComponent} from './units/states/tasks/inbox/inbox.component';
import {FTaskDetailsViewComponent} from './units/task-viewer/directives/task-details-view/task-details-view.component';
import {FTaskSheetViewComponent} from './units/task-viewer/directives/task-sheet-view/task-sheet-view.component';
import {FUnitTaskListComponent} from './units/task-viewer/directives/unit-task-list/unit-task-list.component';
import {TaskViewerStateComponent} from './units/task-viewer/task-viewer-state.component';
import {UnitRootStateComponent} from './units/unit-root-state.component';
import {ProgressBurndownChartComponent} from './visualisations/progress-burndown-chart/progress-burndown-chart.component';
import {TaskVisualisationComponent} from './visualisations/task-visualisation/task-visualisation.component';
import {WelcomeComponent} from './welcome/welcome.component';
// import {GradeTaskModalComponent} from './tasks/modals/grade-task-modal/grade-task-modal.component';
// import {PrivacyPolicy} from './config/privacy-policy/privacy-policy';
import {GANTT_GLOBAL_CONFIG, GanttLinkLineType, NgxGanttModule} from '@worktile/gantt';
import {DiscussionPromptService} from './api/services/discussion-prompt.service';
import {MarkingSessionService} from './api/services/marking-session.service';
import {OverseerStepResultService} from './api/services/overseer-step-result.service';
import {OverseerStepService} from './api/services/overseer-step.service';
import {TutorNoteService} from './api/services/tutor-note.service';
import {TutorNotesModalComponent} from './common/modals/tutor-notes-modal/tutor-notes-modal.component';
import {PrivacyPolicy} from './config/privacy-policy/privacy-policy';
import {GroupSetSelectorComponent} from './groups/group-set-selector/group-set-selector.component';
import {TaskPlannerCardComponent} from './projects/states/dashboard/directives/progress-dashboard/task-planner-card/task-planner-card.component';
import {DiscussionPromptsViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/discussion-prompts-view/discussion-prompts-view.component';
import {SubmissionFilesModalComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-overseer-report/submission-files-modal/submission-files-modal.component';
import {TaskOverseerReportComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-overseer-report/task-overseer-report.component';
import {TutorNotesViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/tutor-notes-view/tutor-notes-view.component';
import {DiscussionPromptsComponent} from './projects/states/discussion-prompts/discussion-prompts.component';
import {TaskPlannerPrerequisitesModalComponent} from './projects/states/plan/task-planner/task-planner-prerequisites-modal/task-planner-prerequisites-modal.component';
import {TaskPlannerPrerequisitesModalService} from './projects/states/plan/task-planner/task-planner-prerequisites-modal/task-planner-prerequisites-modal.service';
import {TaskPlannerComponent} from './projects/states/plan/task-planner/task-planner.component';
import {PortfolioGradeSelectStepComponent} from './projects/states/portfolio/directives/portfolio-grade-select-step/portfolio-grade-select-step.component';
import {PortfolioIncludedTasksComponent} from './projects/states/portfolio/directives/portfolio-review-step/portfolio-included-tasks/portfolio-included-tasks.component';
import {PortfolioReviewStepComponent} from './projects/states/portfolio/directives/portfolio-review-step/portfolio-review-step.component';
import {TutorNotesComponent} from './projects/states/tutor-notes/tutor-notes.component';
import {FeedbackAppealModalComponent} from './tasks/modals/feedback-appeal-modal/feedback-appeal-modal.component';
import {GradeTaskModalComponent} from './tasks/modals/grade-task-modal/grade-task-modal.component';
import {UploadSubmissionModalComponent} from './tasks/modals/upload-submission-modal/upload-submission-modal.component';
import {AnalyticsTutorTimesComponent} from './units/states/analytics/directives/analytics-tutor-times.component';
import {UnitDetailsEditorComponent} from './units/states/edit/directives/unit-details-editor/unit-details-editor.component';
import {UnitStaffEditorComponent} from './units/states/edit/directives/unit-staff-editor/unit-staff-editor.component';
import {TaskDefinitionDiscussionPromptsComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-discussion-prompts/task-definition-discussion-prompts.component';
import {OverseerScriptEditorModalComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-overseer/overseer-script-editor-modal/overseer-script-editor-modal.component';
import {DownloadStaffNotesComponent} from './units/states/portfolios/download-staff-notes/download-staff-notes.component';
import {UploadGradesComponent} from './units/states/portfolios/upload-grades/upload-grades.component';
import {ConfirmModerationModalComponent} from './units/states/tasks/inbox/directives/moderation/confirm-moderation-modal/confirm-moderation-modal.component';
import {ModerationComponent} from './units/states/tasks/inbox/directives/moderation/moderation.component';
import {TaskClaimComponent} from './units/states/tasks/inbox/directives/task-claim/task-claim.component';
// import {GradeTaskModalComponent} from './tasks/modals/grade-task-modal/grade-task-modal.component';
// import {PrivacyPolicy} from './config/privacy-policy/privacy-policy';
import {FileUploaderComponent} from './common/file-uploader/file-uploader.component';
import {CsvResultModalComponent} from './common/modals/csv-result-modal/csv-result-modal.component';
import {CsvResultModalService} from './common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalComponent} from './common/modals/csv-upload-modal/csv-upload-modal.component';
import {CsvUploadModalService} from './common/modals/csv-upload-modal/csv-upload-modal.service';
import {GroupMemberContributionAssignerComponent} from './groups/group-member-contribution-assigner/group-member-contribution-assigner.component';
import {GroupMemberListComponent} from './groups/group-member-list/group-member-list.component';
import {GroupSelectorComponent} from './groups/group-selector/group-selector.component';
import {GroupSetManagerComponent} from './groups/group-set-manager/group-set-manager.component';
import {ProjectGroupsComponent} from './projects/states/groups/project-groups/project-groups.component';
import {ProjectGroupsStateComponent} from './projects/states/groups/project-groups-state.component';
import {PortfolioAddExtraFilesStepComponent} from './projects/states/portfolio/directives/portfolio-add-extra-files-step/portfolio-add-extra-files-step.component';
import {PortfolioStateComponent} from './projects/states/portfolio/portfolio-state.component';
import {PortfolioLearningSummaryReportStepComponent} from './projects/states/portfolio/directives/portfolio-learning-summary-report-step/portfolio-learning-summary-report-step.component';
import {PortfolioWelcomeStepComponent} from './projects/states/portfolio/directives/portfolio-welcome-step/portfolio-welcome-step.component';
import {TutorialsComponent} from './projects/states/tutorials/tutorials.component';
import {UnitStudentEnrolmentModalComponent} from './units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.component';
import {UnitGroupSetEditorComponent} from './units/states/edit/directives/unit-group-set-editor/unit-group-set-editor.component';
import {UnitGroupsComponent} from './units/states/groups/unit-groups/unit-groups.component';
import {PortfoliosAssessmentComponent} from './units/states/portfolios/directives/portfolios-assessment/portfolios-assessment.component';
import {PortfoliosListComponent} from './units/states/portfolios/directives/portfolios-list/portfolios-list.component';
import {PortfoliosPortfolioViewComponent} from './units/states/portfolios/directives/portfolios-portfolio-view/portfolios-portfolio-view.component';
import {PortfoliosProjectProgressComponent} from './units/states/portfolios/directives/portfolios-project-progress/portfolios-project-progress.component';
import {PortfoliosComponent} from './units/states/portfolios/portfolios.component';
import {RolloverComponent} from './units/states/rollover/rollover.component';
import {TaskStatusPieChartComponent} from './visualisations/task-status-pie-chart/task-status-pie-chart.component';
import {UnitTaskInboxStateComponent} from './units/states/tasks/inbox/unit-task-inbox-state.component';

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
    TaskStatusPieChartComponent,
    AlertComponent,
    ProgressDashboardComponent,
    UnitStudentEnrolmentModalComponent,
    AboutDoubtfireModalContent,
    D2lUnitDetailsFormComponent,
    D2lTransferComponent,
    TeachingPeriodUnitImportDialogComponent,
    ProjectTasksListComponent,
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
    StudentsListComponent,
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
    ProjectProgressDashboardComponent,
    MarkedPipe,
    HumanizedDatePipe,
    IsActiveUnitRole,
    DragDropDirective,
    fPdfViewerComponent,
    SafePipe,
    PdfViewerPanelComponent,
    StaffTaskListComponent,
    TaskSimilarityViewComponent,
    TasksForGroupsetPipe,
    OrderByPipe,
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
    ProjectDashboardComponent,
    GradeIconComponent,
    GradeTaskModalComponent,
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
    InboxDashboardComponent,
    ProjectProgressBarComponent,
    TeachingPeriodListComponent,
    CreateNewUnitModal,
    CreateNewUnitModalContentComponent,
    TiiActionLogComponent,
    FChipComponent,
    UnitCodeComponent,
    NewTeachingPeriodDialogComponent,
    FileViewerComponent,
    ArchiveViewerComponent,
    AlertComponent,
    FUnitTaskListComponent,
    FTaskDetailsViewComponent,
    FTaskSheetViewComponent,
    UnitRootStateComponent,
    ProjectRootStateComponent,
    TaskViewerStateComponent,
    FUsersComponent,
    ProjectProgressGaugeComponent,
    FTaskBadgeComponent,
    FUnitsComponent,
    CommentsModalComponent,
    UnauthorisedComponent,
    ChartBaseComponent,
    ProgressBurndownChartComponent,
    TaskVisualisationComponent,
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
    PortfolioReviewStepComponent,
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
    SubmissionFilesModalComponent,
    TutorNotesComponent,
    TutorNotesViewComponent,
    ModerationComponent,
    TutorNotesModalComponent,
    FeedbackAppealModalComponent,
    UploadSubmissionModalComponent,
    ConfirmModerationModalComponent,
    TaskClaimComponent,
    TutorialsComponent,
    UnitStaffEditorComponent,
    PortfolioGradeSelectStepComponent,
    GroupMemberListComponent,
    GroupSelectorComponent,
    GroupSetManagerComponent,
    FileUploaderComponent,
    PortfolioWelcomeStepComponent,
    PortfolioLearningSummaryReportStepComponent,
    PortfolioAddExtraFilesStepComponent,
    PortfolioStateComponent,
    PortfoliosComponent,
    PortfoliosListComponent,
    PortfoliosProjectProgressComponent,
    PortfoliosPortfolioViewComponent,
    PortfoliosAssessmentComponent,
    UnitGroupsComponent,
    RolloverComponent,
    ProjectGroupsComponent,
    ProjectGroupsStateComponent,
    GroupMemberContributionAssignerComponent,
    CsvResultModalComponent,
    CsvUploadModalComponent,
    UnitGroupSetEditorComponent,
    UnitTaskInboxStateComponent,
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
    gradeTaskModalProvider,
    analyticsServiceProvider,
    dateServiceProvider,
    {provide: MAT_DATE_LOCALE, useValue: enAU},
    {provide: DateAdapter, useClass: DateFnsAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT},
    UnitStudentEnrolmentModalProvider,
    TaskCommentService,
    AudioRecorderProvider,
    AudioRecorderServiceProvider,
    plagiarismReportModalProvider,
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
    PrivacyPolicy,
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
    CsvResultModalService,
    CsvUploadModalService,
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
    MatSidenavModule,
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
    MatGridListModule,
    MatTabsModule,
    UpgradeModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    PickerModule,
    EmojiModule,
    NgxChartsModule,
    PdfViewerModule,
    LottieComponent,
    UIRouterUpgradeModule.forRoot({states: doubtfireStates}),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: () => interval(6000).pipe(take(1)),
    }),
    CalendarModule.forRoot({provide: CalendarDateAdapter, useFactory: adapterFactory}),
    CodeEditorModule.forRoot(),
    NgxGanttModule,
    MonacoEditorModule.forRoot(),
    MatChipListbox,
    FileUploadModule,
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
