// #
// # Doubtfire - A lightweight, modern learning management system
// #
// # Doubtfire is modularised into many modules, as indicated by the directory
// # tree inside app/
// #

import {downgradeComponent, downgradeInjectable} from '@angular/upgrade/static';
import * as angular from 'angular';

// Here are the old angular node modules, previously loaded via grunt
//#region
import 'angular-filter/dist/angular-filter.js';
import 'angular-markdown-filter/markdown.js';
import 'angular-md5/angular-md5.js';
import 'angular-nvd3/dist/angular-nvd3.js';
import 'angular-resource/angular-resource.js';
import 'angular-sanitize/angular-sanitize.js';
import 'angular-ui-bootstrap/ui-bootstrap-tpls.js';
import 'angular-ui-codemirror/src/ui-codemirror.js';
import 'angular-xeditable/dist/js/xeditable.js';
import 'angulartics-google-analytics/lib/angulartics-google-analytics.js';
import 'angulartics/dist/angulartics.min.js';
import 'ng-csv/build/ng-csv.js';
import 'ng-file-upload/dist/ng-file-upload-all.min.js';

// Ok... here is what we need to convert!

import 'build/assets/wav-worker.js';
import 'build/src/app/common/common.js';
import 'build/src/app/common/content-editable/content-editable.js';
import 'build/src/app/common/filters/filters.js';
import 'build/src/app/common/services/analytics-service.js';
import 'build/src/app/common/services/listener-service.js';
import 'build/src/app/common/services/outcome-service.js';
import 'build/src/app/common/services/recorder-service.js';
import 'build/src/app/common/services/services.js';
import 'build/src/app/config/analytics/analytics.js';
import 'build/src/app/config/config.js';
import 'build/src/app/config/root-controller/root-controller.js';
import 'build/src/app/config/routing/routing.js';
import 'build/src/app/config/runtime/runtime.js';
import 'build/src/app/config/vendor-dependencies/vendor-dependencies.js';
import 'build/src/app/projects/projects.js';
import 'build/src/app/projects/states/dashboard/dashboard.js';
import 'build/src/app/projects/states/dashboard/directives/directives.js';
import 'build/src/app/projects/states/dashboard/directives/student-task-list/student-task-list.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/task-dashboard.js';
import 'build/src/app/projects/states/feedback/feedback.js';
import 'build/src/app/projects/states/index/index.js';
import 'build/src/app/projects/states/states.js';
import 'build/src/app/units/states/analytics/analytics.js';
import 'build/src/app/units/states/edit/edit.js';
import 'build/src/app/units/states/groups/groups.js';
import 'build/src/app/units/states/index/index.js';
import 'build/src/app/units/states/states.js';
// import 'build/src/app/units/states/tasks/viewer/viewer.js';
import 'build/src/app/units/units.js';
import 'build/src/app/visualisations/summary-task-status-scatter.js';
import 'build/src/app/visualisations/target-grade-pie-chart.js';
import 'build/src/app/visualisations/task-completion-box-plot.js';
import 'build/src/app/visualisations/task-status-pie-chart.js';
import 'build/src/app/visualisations/visualisations.js';
import 'build/src/common/i18n/localize.js';
import 'build/src/common/utilService/utilService.js';
import 'build/src/i18n/resources-locale_default.js';
import 'build/src/i18n/resources-locale_en-AU.js';
import 'build/src/i18n/resources-locale_en-GB.js';
import 'build/src/i18n/resources-locale_en-US.js';
import 'build/templates-app.js';
//#endregion

import {AboutDoubtfireModal} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {TaskCommentComposerComponent} from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import {ActivityTypeListComponent} from './admin/institution-settings/activity-type-list/activity-type-list.component';
import {CampusListComponent} from './admin/institution-settings/campuses/campus-list/campus-list.component';
import {InstitutionSettingsComponent} from './admin/institution-settings/institution-settings.component';
import {CreateNewUnitModal} from './admin/modals/create-new-unit-modal/create-new-unit-modal.component';
// import {FUnitsComponent} from './admin/states/f-units/f-units.component';
// import {FUsersComponent} from './admin/states/f-users/f-users.component';
import {FUnitsComponent} from './admin/states/units/units.component';
import {FUsersComponent} from './admin/states/users/users.component';
import {
  GroupSetService,
  LearningOutcomeService,
  TaskCommentService,
  TaskOutcomeAlignmentService,
  TaskService,
  TeachingPeriodService,
  UnitRoleService,
  UnitService,
  UserService,
} from './api/models/doubtfire-model';
import {AuthenticationService} from './api/services/authentication.service';
import {CampusService} from './api/services/campus.service';
import {FeedbackTemplateService} from './api/services/feedback-template.service';
import {GroupService} from './api/services/group.service';
import {ProjectService} from './api/services/project.service';
import {TaskDefinitionService} from './api/services/task-definition.service';
import {TutorialStreamService} from './api/services/tutorial-stream.service';
import {TutorialService} from './api/services/tutorial.service';
import {WebcalService} from './api/services/webcal.service';
import {FileDownloaderService} from './common/file-downloader/file-downloader.service';
import {FooterComponent} from './common/footer/footer.component';
import {GradeIconComponent} from './common/grade-icon/grade-icon.component';
import {HeaderComponent} from './common/header/header.component';
import {LearningOutcomeEditorComponent} from './common/learning-outcome-editor/learning-outcome-editor.component';
import {CalendarModalService} from './common/modals/calendar-modal/calendar-modal.service';
import {CommentsModalService} from './common/modals/comments-modal/comments-modal.service';
import {ConfirmationModalService} from './common/modals/confirmation-modal/confirmation-modal.service';
import {EditProfileDialogService} from './common/modals/edit-profile-dialog/edit-profile-dialog.service';
import {ExtensionModalService} from './common/modals/extension-modal/extension-modal.service';
import {SidekiqProgressModalService} from './common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {TaskAssessmentModalService} from './common/modals/task-assessment-modal/task-assessment-modal.service';
import {ObjectSelectComponent} from './common/obect-select/object-select.component';
import {PdfViewerPanelComponent} from './common/pdf-viewer-panel/pdf-viewer-panel.component';
import {fPdfViewerComponent} from './common/pdf-viewer/pdf-viewer.component';
import {AlertService} from './common/services/alert.service';
import {DateService} from './common/services/date.service';
import {EmojiService} from './common/services/emoji.service';
import {GradeService} from './common/services/grade.service';
import {TaskSubmissionService} from './common/services/task-submission.service';
import {StatusIconComponent} from './common/status-icon/status-icon.component';
import {UserBadgeComponent} from './common/user-badge/user-badge.component';
import {UserIconComponent} from './common/user-icon/user-icon.component';
import {UnauthorisedComponent} from './errors/states/unauthorised/unauthorised.component';
import {SplashScreenComponent} from './home/splash-screen/splash-screen.component';
import {ProgressDashboardComponent} from './projects/states/dashboard/directives/progress-dashboard/progress-dashboard.component';
import {CreatePortfolioTaskListItemComponent} from './projects/states/dashboard/directives/student-task-list/create-portfolio-task-list-item/create-portfolio-task-list-item.component';
import {TaskListItemComponent} from './projects/states/dashboard/directives/student-task-list/task-list-item/task-list-item.component';
import {TaskAssessmentCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.component';
import {TaskDescriptionCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.component';
import {TaskDueCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.component';
import {TaskIlosCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-ilos-card/task-ilos-card.component';
import {TaskPrerequisitesCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-prerequisites-card/task-prerequisites-card.component';
import {TaskScormCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-scorm-card/task-scorm-card.component';
import {TaskStatusCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.component';
import {TaskSubmissionCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.component';
import {GlobalStateService} from './projects/states/index/global-state.service';
import {StaffNotesComponent} from './projects/states/staff-notes/staff-notes.component';
import {TutorialsComponent} from './projects/states/tutorials/tutorials.component';
import {CheckForUpdateService} from './sessions/service-worker-updater/check-for-update.service';
import {TransitionHooksService} from './sessions/transition-hooks.service';
import {GradeTaskModalService} from './tasks/modals/grade-task-modal/grade-task-modal.service';
import {ProjectTasksListComponent} from './tasks/project-tasks-list/project-tasks-list.component';
import {CommentBubbleActionComponent} from './tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component';
import {ExtensionCommentComponent} from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import {IntelligentDiscussionPlayerComponent} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import {TaskAssessmentCommentComponent} from './tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component';
import {TaskCommentsViewerComponent} from './tasks/task-comments-viewer/task-comments-viewer.component';
import {TaskSubmissionHistoryComponent} from './tasks/task-submission-history/task-submission-history.component';
import {UnitAnalyticsComponent} from './units/states/analytics/unit-analytics-route.component';
import {D2lUnitDetailsModal} from './units/states/edit/directives/unit-details-editor/d2l-details-form/d2l-unit-details-form.component';
import {StudentCampusSelectComponent} from './units/states/edit/directives/unit-students-editor/student-campus-select/student-campus-select.component';
import {StudentTutorialSelectComponent} from './units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';
import {UnitStudentsEditorComponent} from './units/states/edit/directives/unit-students-editor/unit-students-editor.component';
import {TaskDefinitionEditorComponent} from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-editor.component';
import {UnitTaskEditorComponent} from './units/states/edit/directives/unit-tasks-editor/unit-task-editor.component';
import {UnitTutorialsListComponent} from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import {UnitTutorialsManagerComponent} from './units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component';
import {D2lTransferModal} from './units/states/portfolios/d2l-transfer-modal/d2l-transfer.component';
import {StudentsListComponent} from './units/states/students-list/students-list.component';
import {StaffTaskListComponent} from './units/states/tasks/inbox/directives/staff-task-list/staff-task-list.component';
import {InboxComponent} from './units/states/tasks/inbox/inbox.component';
// import {FTaskDetailsViewComponent} from './units/states/tasks/viewer/directives/f-task-details-view/f-task-details-view.component';
// import {FTaskSheetViewComponent} from './units/states/tasks/viewer/directives/f-task-sheet-view/f-task-sheet-view.component';
// import {FUnitTaskListComponent} from './units/states/tasks/viewer/directives/f-unit-task-list/f-unit-task-list.component';
import {FUnitTaskListComponent} from './units/task-viewer/directives/unit-task-list/unit-task-list.component';
import {FTaskSheetViewComponent} from './units/task-viewer/directives/task-sheet-view/task-sheet-view.component';
import {FTaskDetailsViewComponent} from './units/task-viewer/directives/task-details-view/task-details-view.component';
import {ProgressBurndownChartComponent} from './visualisations/progress-burndown-chart/progress-burndown-chart.component';
import {TaskStatusPieChartComponent} from './visualisations/task-status-pie-chart/task-status-pie-chart.component';
import {TaskVisualisationComponent} from './visualisations/task-visualisation/task-visualisation.component';
// import { UnitStudentEnrolmentModalService } from './units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.service';
// import { PrivacyPolicy } from './config/privacy-policy/privacy-policy';
import {PrivacyPolicy} from './config/privacy-policy/privacy-policy';
import {GroupSetSelectorComponent} from './groups/group-set-selector/group-set-selector.component';
import {TaskPlannerCardComponent} from './projects/states/dashboard/directives/progress-dashboard/task-planner-card/task-planner-card.component';
import {TaskOverseerReportComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-overseer-report/task-overseer-report.component';
import {TaskSimilarityViewComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-similarity-view/task-similarity-view.component';
import {ProjectPlanComponent} from './projects/states/plan/project-plan.component';
import {TaskPlannerComponent} from './projects/states/plan/task-planner/task-planner.component';
import {PortfolioGradeSelectStepComponent} from './projects/states/portfolio/directives/portfolio-grade-select-step/portfolio-grade-select-step.component';
import {PortfolioIncludedTasksComponent} from './projects/states/portfolio/directives/portfolio-review-step/portfolio-included-tasks/portfolio-included-tasks.component';
import {PortfolioReviewStepComponent} from './projects/states/portfolio/directives/portfolio-review-step/portfolio-review-step.component';
import {TutorNotesComponent} from './projects/states/tutor-notes/tutor-notes.component';
import {UnitStudentEnrolmentModalService} from './units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.service';
import {UnitDetailsEditorComponent} from './units/states/edit/directives/unit-details-editor/unit-details-editor.component';
import {UnitStaffEditorComponent} from './units/states/edit/directives/unit-staff-editor/unit-staff-editor.component';
import {DownloadStaffNotesComponent} from './units/states/portfolios/download-staff-notes/download-staff-notes.component';
import {UploadGradesComponent} from './units/states/portfolios/upload-grades/upload-grades.component';

// import { UnitStudentEnrolmentModalService } from './units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.service';
// import { PrivacyPolicy } from './config/privacy-policy/privacy-policy';
import {FileUploaderComponent} from './common/file-uploader/file-uploader.component';
import {GroupMemberContributionAssignerComponent} from './groups/group-member-contribution-assigner/group-member-contribution-assigner.component';
import {GroupMemberListComponent} from './groups/group-member-list/group-member-list.component';
import {GroupSelectorComponent} from './groups/group-selector/group-selector.component';
import {GroupSetManagerComponent} from './groups/group-set-manager/group-set-manager.component';
import {ProjectGroupsComponent} from './projects/states/groups/project-groups/project-groups.component';
import {PortfolioAddExtraFilesStepComponent} from './projects/states/portfolio/directives/portfolio-add-extra-files-step/portfolio-add-extra-files-step.component';
import {PortfolioLearningSummaryReportStepComponent} from './projects/states/portfolio/directives/portfolio-learning-summary-report-step/portfolio-learning-summary-report-step.component';
import {PortfolioWelcomeStepComponent} from './projects/states/portfolio/directives/portfolio-welcome-step/portfolio-welcome-step.component';
import {UnitGroupSetEditorComponent} from './units/states/edit/directives/unit-group-set-editor/unit-group-set-editor.component';
import {UnitGroupsComponent} from './units/states/groups/unit-groups/unit-groups.component';

export const DoubtfireAngularJSModule = angular
  .module('doubtfire', [
    'doubtfire.config',
    'doubtfire.common',
    'doubtfire.units',
    'doubtfire.projects',
    'doubtfire.visualisations',
  ])
  .config([
    '$locationProvider',
    ($locationProvider) => {
      $locationProvider.html5Mode(true);
    },
  ]);

// Downgrade angular modules that we need...
// factory -> service
DoubtfireAngularJSModule.factory('AboutDoubtfireModal', downgradeInjectable(AboutDoubtfireModal));
DoubtfireAngularJSModule.factory('D2lUnitDetailsModal', downgradeInjectable(D2lUnitDetailsModal));
DoubtfireAngularJSModule.factory('D2lTransferModal', downgradeInjectable(D2lTransferModal));
DoubtfireAngularJSModule.factory('DoubtfireConstants', downgradeInjectable(DoubtfireConstants));
DoubtfireAngularJSModule.factory('ExtensionModal', downgradeInjectable(ExtensionModalService));
DoubtfireAngularJSModule.factory('CalendarModal', downgradeInjectable(CalendarModalService));
DoubtfireAngularJSModule.factory(
  'ConfirmationModal',
  downgradeInjectable(ConfirmationModalService),
);
DoubtfireAngularJSModule.factory('TaskCommentService', downgradeInjectable(TaskCommentService));
DoubtfireAngularJSModule.factory('alertService', downgradeInjectable(AlertService));
DoubtfireAngularJSModule.factory('tutorialService', downgradeInjectable(TutorialService));
DoubtfireAngularJSModule.factory('streamService', downgradeInjectable(TutorialStreamService));
DoubtfireAngularJSModule.factory('campusService', downgradeInjectable(CampusService));
DoubtfireAngularJSModule.factory(
  'authenticationService',
  downgradeInjectable(AuthenticationService),
);
DoubtfireAngularJSModule.factory('newUserService', downgradeInjectable(UserService));
DoubtfireAngularJSModule.factory('newUnitService', downgradeInjectable(UnitService));
DoubtfireAngularJSModule.factory('newUnitRoleService', downgradeInjectable(UnitRoleService));
DoubtfireAngularJSModule.factory('newTaskService', downgradeInjectable(TaskService));
DoubtfireAngularJSModule.factory(
  'newTaskDefinitionService',
  downgradeInjectable(TaskDefinitionService),
);
DoubtfireAngularJSModule.factory(
  'newTeachingPeriodService',
  downgradeInjectable(TeachingPeriodService),
);
DoubtfireAngularJSModule.factory('newProjectService', downgradeInjectable(ProjectService));
DoubtfireAngularJSModule.factory('newGroupService', downgradeInjectable(GroupService));
DoubtfireAngularJSModule.factory('newGroupSetService', downgradeInjectable(GroupSetService));
DoubtfireAngularJSModule.factory(
  'newTaskOutcomeAlignmentService',
  downgradeInjectable(TaskOutcomeAlignmentService),
);
DoubtfireAngularJSModule.factory('webcalService', downgradeInjectable(WebcalService));
DoubtfireAngularJSModule.factory(
  'newLearningOutcomeService',
  downgradeInjectable(LearningOutcomeService),
);
DoubtfireAngularJSModule.factory('emojiService', downgradeInjectable(EmojiService));
DoubtfireAngularJSModule.factory('gradeService', downgradeInjectable(GradeService));
DoubtfireAngularJSModule.factory(
  'fileDownloaderService',
  downgradeInjectable(FileDownloaderService),
);
DoubtfireAngularJSModule.factory(
  'checkForUpdateService',
  downgradeInjectable(CheckForUpdateService),
);
DoubtfireAngularJSModule.factory(
  'TaskAssessmentModal',
  downgradeInjectable(TaskAssessmentModalService),
);
DoubtfireAngularJSModule.factory('TaskSubmission', downgradeInjectable(TaskSubmissionService));
DoubtfireAngularJSModule.factory('globalStateService', downgradeInjectable(GlobalStateService));
DoubtfireAngularJSModule.factory(
  'TransitionHooksService',
  downgradeInjectable(TransitionHooksService),
);
DoubtfireAngularJSModule.factory(
  'EditProfileService',
  downgradeInjectable(EditProfileDialogService),
);
DoubtfireAngularJSModule.factory('dateService', downgradeInjectable(DateService));
DoubtfireAngularJSModule.factory('CreateNewUnitModal', downgradeInjectable(CreateNewUnitModal));
DoubtfireAngularJSModule.factory('CommentsModal', downgradeInjectable(CommentsModalService));

DoubtfireAngularJSModule.factory(
  'FeedbackTemplateService',
  downgradeInjectable(FeedbackTemplateService),
);

DoubtfireAngularJSModule.factory(
  'sidekiqProgressModalService',
  downgradeInjectable(SidekiqProgressModalService),
);
DoubtfireAngularJSModule.factory('GradeTaskModal', downgradeInjectable(GradeTaskModalService));
DoubtfireAngularJSModule.factory(
  'UnitStudentEnrolmentModal',
  downgradeInjectable(UnitStudentEnrolmentModalService),
);
DoubtfireAngularJSModule.factory('PrivacyPolicy', downgradeInjectable(PrivacyPolicy));

// directive -> component
DoubtfireAngularJSModule.directive(
  'fTaskStatusPieChart',
  downgradeComponent({component: TaskStatusPieChartComponent}),
);
DoubtfireAngularJSModule.directive(
  'fProgressDashboard',
  downgradeComponent({component: ProgressDashboardComponent}),
);
DoubtfireAngularJSModule.directive(
  'fProjectTasksList',
  downgradeComponent({component: ProjectTasksListComponent}),
);
DoubtfireAngularJSModule.directive(
  'gradeIcon',
  downgradeComponent({component: GradeIconComponent}),
);
DoubtfireAngularJSModule.directive(
  'taskCommentComposer',
  downgradeComponent({component: TaskCommentComposerComponent}),
);
DoubtfireAngularJSModule.directive(
  'objectSelect',
  downgradeComponent({component: ObjectSelectComponent}),
);
DoubtfireAngularJSModule.directive(
  'fGradeIcon',
  downgradeComponent({component: GradeIconComponent}),
);
DoubtfireAngularJSModule.directive('appHeader', downgradeComponent({component: HeaderComponent}));
DoubtfireAngularJSModule.directive(
  'splashScreen',
  downgradeComponent({component: SplashScreenComponent}),
);
DoubtfireAngularJSModule.directive(
  'userBadge',
  downgradeComponent({component: UserBadgeComponent}),
);
DoubtfireAngularJSModule.directive(
  'fTaskSubmissionCard',
  downgradeComponent({component: TaskSubmissionCardComponent}),
);

DoubtfireAngularJSModule.directive('fFooter', downgradeComponent({component: FooterComponent}));
DoubtfireAngularJSModule.directive(
  'intelligentDiscussionPlayer',
  downgradeComponent({component: IntelligentDiscussionPlayerComponent}),
);
DoubtfireAngularJSModule.directive(
  'fUnitAnalytics',
  downgradeComponent({component: UnitAnalyticsComponent}),
);
DoubtfireAngularJSModule.directive(
  'extensionComment',
  downgradeComponent({component: ExtensionCommentComponent}),
);
DoubtfireAngularJSModule.directive(
  'fUnitTaskList',
  downgradeComponent({component: FUnitTaskListComponent}),
);
DoubtfireAngularJSModule.directive(
  'fTaskDetailsView',
  downgradeComponent({component: FTaskDetailsViewComponent}),
);
DoubtfireAngularJSModule.directive(
  'fTaskSheetView',
  downgradeComponent({component: FTaskSheetViewComponent}),
);
DoubtfireAngularJSModule.directive(
  'campusList',
  downgradeComponent({component: CampusListComponent}),
);
DoubtfireAngularJSModule.directive(
  'activityTypeList',
  downgradeComponent({component: ActivityTypeListComponent}),
);
DoubtfireAngularJSModule.directive(
  'fTaskScormCard',
  downgradeComponent({component: TaskScormCardComponent}),
);
DoubtfireAngularJSModule.directive(
  'fTaskStatusCard',
  downgradeComponent({component: TaskStatusCardComponent}),
);
DoubtfireAngularJSModule.directive('fInbox', downgradeComponent({component: InboxComponent}));
DoubtfireAngularJSModule.directive(
  'fTaskDueCard',
  downgradeComponent({component: TaskDueCardComponent}),
);
DoubtfireAngularJSModule.directive('fUsers', downgradeComponent({component: FUsersComponent}));
DoubtfireAngularJSModule.directive(
  'fTaskAssessmentCard',
  downgradeComponent({component: TaskAssessmentCardComponent}),
);
DoubtfireAngularJSModule.directive(
  'institutionSettings',
  downgradeComponent({component: InstitutionSettingsComponent}),
);
DoubtfireAngularJSModule.directive(
  'commentBubbleAction',
  downgradeComponent({component: CommentBubbleActionComponent}),
);
DoubtfireAngularJSModule.directive(
  'unitTutorialsList',
  downgradeComponent({component: UnitTutorialsListComponent}),
);
DoubtfireAngularJSModule.directive(
  'unitTutorialsManager',
  downgradeComponent({component: UnitTutorialsManagerComponent}),
);
DoubtfireAngularJSModule.directive(
  'unitStudentsEditor',
  downgradeComponent({component: UnitStudentsEditorComponent}),
);
DoubtfireAngularJSModule.directive(
  'fStudentsList',
  downgradeComponent({component: StudentsListComponent}),
);
DoubtfireAngularJSModule.directive(
  'fTaskDefinitionEditor',
  downgradeComponent({component: TaskDefinitionEditorComponent}),
);
DoubtfireAngularJSModule.directive(
  'fUnitTaskEditor',
  downgradeComponent({component: UnitTaskEditorComponent}),
);
DoubtfireAngularJSModule.directive(
  'studentTutorialSelect',
  downgradeComponent({component: StudentTutorialSelectComponent}),
);
DoubtfireAngularJSModule.directive(
  'studentCampusSelect',
  downgradeComponent({component: StudentCampusSelectComponent}),
);
DoubtfireAngularJSModule.directive(
  'taskListItem',
  downgradeComponent({component: TaskListItemComponent}),
);
DoubtfireAngularJSModule.directive(
  'createPortfolioTaskListItem',
  downgradeComponent({component: CreatePortfolioTaskListItemComponent}),
);
DoubtfireAngularJSModule.directive(
  'taskDescriptionCard',
  downgradeComponent({component: TaskDescriptionCardComponent}),
);

DoubtfireAngularJSModule.directive(
  'taskAssessmentComment',
  downgradeComponent({component: TaskAssessmentCommentComponent}),
);
DoubtfireAngularJSModule.directive(
  'taskSubmissionHistory',
  downgradeComponent({component: TaskSubmissionHistoryComponent}),
);
DoubtfireAngularJSModule.directive('fUnits', downgradeComponent({component: FUnitsComponent}));

// Global configuration
DoubtfireAngularJSModule.directive(
  'taskCommentsViewer',
  downgradeComponent({component: TaskCommentsViewerComponent}),
);
DoubtfireAngularJSModule.directive('userIcon', downgradeComponent({component: UserIconComponent}));
DoubtfireAngularJSModule.directive(
  'fPdfViewer',
  downgradeComponent({component: fPdfViewerComponent}),
);
DoubtfireAngularJSModule.directive(
  'pdfViewerPanel',
  downgradeComponent({component: PdfViewerPanelComponent}),
);
DoubtfireAngularJSModule.directive(
  'staffTaskList',
  downgradeComponent({component: StaffTaskListComponent}),
);
DoubtfireAngularJSModule.directive(
  'statusIcon',
  downgradeComponent({component: StatusIconComponent}),
);
DoubtfireAngularJSModule.directive(
  'fLearningOutcomeEditor',
  downgradeComponent({component: LearningOutcomeEditorComponent}),
);
DoubtfireAngularJSModule.directive('newFUnits', downgradeComponent({component: FUnitsComponent}));

DoubtfireAngularJSModule.directive(
  'fTutorials',
  downgradeComponent({component: TutorialsComponent}),
);
DoubtfireAngularJSModule.directive(
  'unitStaffEditor',
  downgradeComponent({component: UnitStaffEditorComponent}),
);
DoubtfireAngularJSModule.directive(
  'fTaskIlosCard',
  downgradeComponent({component: TaskIlosCardComponent}),
);
DoubtfireAngularJSModule.directive(
  'fStaffNotes',
  downgradeComponent({component: StaffNotesComponent}),
);

DoubtfireAngularJSModule.directive(
  'fTaskPrerequisitesCard',
  downgradeComponent({component: TaskPrerequisitesCardComponent}),
);

DoubtfireAngularJSModule.directive(
  'unitDetailsEditor',
  downgradeComponent({component: UnitDetailsEditorComponent}),
);

DoubtfireAngularJSModule.directive(
  'unauthorised',
  downgradeComponent({component: UnauthorisedComponent}),
);

DoubtfireAngularJSModule.directive(
  'fPortfolioGradeSelectStep',
  downgradeComponent({component: PortfolioGradeSelectStepComponent}),
);

// Global configuration

// If the user enters a URL that doesn't match any known URL (state), send them to `/home`
const otherwiseConfigBlock = [
  '$urlRouterProvider',
  '$locationProvider',
  ($urlRouterProvider, $locationProvider) => {
    $locationProvider.hashPrefix('');
    $urlRouterProvider.otherwise('/home');
  },
];
DoubtfireAngularJSModule.config(otherwiseConfigBlock);

// DoubtfireAngularJSModule.directive(
//   'fProgressBurndownChart',
//   downgradeComponent({ component: ProgressBurndownChartComponent })
// );

// DoubtfireAngularJSModule.directive(
//   'fTaskVisualisation',
//   downgradeComponent({ component: TaskVisualisationComponent })
// );

DoubtfireAngularJSModule.directive(
  'groupSetSelector',
  downgradeComponent({component: GroupSetSelectorComponent}),
);

DoubtfireAngularJSModule.directive(
  'fPortfolioIncludedTasks',
  downgradeComponent({component: PortfolioIncludedTasksComponent}),
);

DoubtfireAngularJSModule.directive(
  'fTaskSimilarityView',
  downgradeComponent({component: TaskSimilarityViewComponent}),
);

DoubtfireAngularJSModule.directive(
  'fUploadGrades',
  downgradeComponent({component: UploadGradesComponent}),
);

DoubtfireAngularJSModule.directive(
  'fDownloadStaffNotes',
  downgradeComponent({component: DownloadStaffNotesComponent}),
);

DoubtfireAngularJSModule.directive(
  'fProjectPlan',
  downgradeComponent({component: ProjectPlanComponent}),
);

DoubtfireAngularJSModule.directive(
  'fTaskPlanner',
  downgradeComponent({component: TaskPlannerComponent}),
);

DoubtfireAngularJSModule.directive(
  'fTaskPlannerCard',
  downgradeComponent({component: TaskPlannerCardComponent}),
);

DoubtfireAngularJSModule.directive(
  'fTaskOverseerReport',
  downgradeComponent({component: TaskOverseerReportComponent}),
);

DoubtfireAngularJSModule.directive(
  'fTutorNotes',
  downgradeComponent({component: TutorNotesComponent}),
);

DoubtfireAngularJSModule.directive(
  'fProgressBurndownChart',
  downgradeComponent({component: ProgressBurndownChartComponent}),
);

DoubtfireAngularJSModule.directive(
  'fTaskVisualisation',
  downgradeComponent({component: TaskVisualisationComponent}),
);

DoubtfireAngularJSModule.directive(
  'fGroupMemberList',
  downgradeComponent({component: GroupMemberListComponent}),
);

DoubtfireAngularJSModule.directive(
  'fGroupSelector',
  downgradeComponent({component: GroupSelectorComponent}),
);

DoubtfireAngularJSModule.directive(
  'fGroupSetManager',
  downgradeComponent({component: GroupSetManagerComponent}),
);

DoubtfireAngularJSModule.directive(
  'fFileUploader',
  downgradeComponent({component: FileUploaderComponent}),
);

DoubtfireAngularJSModule.directive(
  'fPortfolioWelcomeStep',
  downgradeComponent({component: PortfolioWelcomeStepComponent}),
);

DoubtfireAngularJSModule.directive(
  'fPortfolioLearningSummaryReportStep',
  downgradeComponent({component: PortfolioLearningSummaryReportStepComponent}),
);

DoubtfireAngularJSModule.directive(
  'fPortfolioAddExtraFilesStep',
  downgradeComponent({component: PortfolioAddExtraFilesStepComponent}),
);

DoubtfireAngularJSModule.directive(
  'fPortfolioReviewStep',
  downgradeComponent({component: PortfolioReviewStepComponent}),
);

DoubtfireAngularJSModule.directive(
  'fUnitGroups',
  downgradeComponent({component: UnitGroupsComponent}),
);

DoubtfireAngularJSModule.directive(
  'fProjectGroups',
  downgradeComponent({component: ProjectGroupsComponent}),
);

DoubtfireAngularJSModule.directive(
  'fGroupMemberContributionAssigner',
  downgradeComponent({component: GroupMemberContributionAssignerComponent}),
);

DoubtfireAngularJSModule.directive(
  'fUnitGroupSetEditor',
  downgradeComponent({component: UnitGroupSetEditorComponent}),
);
