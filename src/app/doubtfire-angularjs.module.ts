// #
// # Doubtfire - A lightweight, modern learning management system
// #
// # Doubtfire is modularised into many modules, as indicated by the directory
// # tree inside app/
// #

import * as angular from 'angular';
import {downgradeInjectable, downgradeComponent} from '@angular/upgrade/static';

// Here are the old angular node modules, previously loaded via grunt
//#region
import 'angular-cookies/angular-cookies.js';
import 'angular-local-storage/dist/angular-local-storage.js';
import 'angular-resource/angular-resource.js';
import 'angular-ui-bootstrap/ui-bootstrap-tpls.js';
import 'angular-nvd3/dist/angular-nvd3.js';
import 'angular-file-upload/angular-file-upload.js';
import 'ng-file-upload/dist/ng-file-upload-all.min.js';
import 'angular-sanitize/angular-sanitize.js';
import 'ng-csv/build/ng-csv.js';
import 'angular-xeditable/dist/js/xeditable.js';
import 'angular-filter/dist/angular-filter.js';
import 'angular-ui-codemirror/src/ui-codemirror.js';
import 'angular-markdown-filter/markdown.js';
import 'angulartics/dist/angulartics.min.js';
import 'angulartics-google-analytics/lib/angulartics-google-analytics.js';
import 'angular-md5/angular-md5.js';

// Ok... here is what we need to convert!

import 'build/templates-app.js';
import 'build/assets/wav-worker.js';
import 'build/src/app/visualisations/summary-task-status-scatter.js';
import 'build/src/app/visualisations/student-task-status-pie-chart.js';
import 'build/src/app/visualisations/progress-burndown-chart.js';
import 'build/src/app/visualisations/target-grade-pie-chart.js';
import 'build/src/app/visualisations/task-status-pie-chart.js';
import 'build/src/app/visualisations/task-completion-box-plot.js';
import 'build/src/app/visualisations/visualisations.js';
import 'build/src/app/visualisations/alignment-bullet-chart.js';
import 'build/src/app/visualisations/achievement-custom-bar-chart.js';
import 'build/src/app/visualisations/alignment-bar-chart.js';
import 'build/src/app/visualisations/achievement-box-plot.js';
import 'build/src/app/tasks/modals/upload-submission-modal/upload-submission-modal.js';
import 'build/src/app/tasks/modals/modals.js';
import 'build/src/app/tasks/tasks.js';
import 'build/src/app/tasks/task-ilo-alignment/task-ilo-alignment.js';
import 'build/src/app/tasks/task-ilo-alignment/task-ilo-alignment-rater/task-ilo-alignment-rater.js';
import 'build/src/app/tasks/task-ilo-alignment/modals/task-ilo-alignment.js';
import 'build/src/app/tasks/task-ilo-alignment/modals/task-ilo-alignment-modal/task-ilo-alignment-modal.js';
import 'build/src/app/tasks/task-ilo-alignment/task-ilo-alignment-editor/task-ilo-alignment-editor.js';
import 'build/src/app/tasks/task-ilo-alignment/task-ilo-alignment-viewer/task-ilo-alignment-viewer.js';
import 'build/src/app/config/runtime/runtime.js';
import 'build/src/app/config/config.js';
import 'build/src/app/config/root-controller/root-controller.js';
import 'build/src/app/config/local-storage/local-storage.js';
import 'build/src/app/config/routing/routing.js';
import 'build/src/app/config/vendor-dependencies/vendor-dependencies.js';
import 'build/src/app/config/analytics/analytics.js';
import 'build/src/app/config/debug/debug.js';
import 'build/src/app/projects/projects.js';
import 'build/src/app/projects/project-progress-dashboard/project-progress-dashboard.js';
import 'build/src/app/projects/states/groups/groups.js';
import 'build/src/app/projects/states/feedback/feedback.js';
import 'build/src/app/projects/states/states.js';
import 'build/src/app/projects/states/dashboard/directives/progress-dashboard/progress-dashboard.js';
import 'build/src/app/projects/states/dashboard/directives/student-task-list/student-task-list.js';
import 'build/src/app/projects/states/dashboard/directives/directives.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/task-dashboard.js';
import 'build/src/app/projects/states/dashboard/dashboard.js';
import 'build/src/app/projects/states/outcomes/outcomes.js';
import 'build/src/app/projects/states/portfolio/directives/portfolio-review-step/portfolio-review-step.js';
import 'build/src/app/projects/states/portfolio/directives/portfolio-learning-summary-report-step/portfolio-learning-summary-report-step.js';
import 'build/src/app/projects/states/portfolio/directives/portfolio-add-extra-files-step/portfolio-add-extra-files-step.js';
import 'build/src/app/projects/states/portfolio/directives/portfolio-grade-select-step/portfolio-grade-select-step.js';
import 'build/src/app/projects/states/portfolio/directives/portfolio-welcome-step/portfolio-welcome-step.js';
import 'build/src/app/projects/states/portfolio/directives/portfolio-tasks-step/portfolio-tasks-step.js';
import 'build/src/app/projects/states/portfolio/directives/directives.js';
import 'build/src/app/projects/states/portfolio/portfolio.js';
import 'build/src/app/projects/states/index/index.js';
import 'build/src/app/projects/states/tutorials/tutorials.js';
import 'build/src/app/projects/project-outcome-alignment/project-outcome-alignment.js';
import 'build/src/app/admin/modals/modals.js';
import 'build/src/app/admin/modals/create-unit-modal/create-unit-modal.js';
import 'build/src/app/groups/group-selector/group-selector.js';
import 'build/src/app/groups/group-set-manager/group-set-manager.js';
import 'build/src/app/groups/groups.js';
import 'build/src/app/groups/group-member-contribution-assigner/group-member-contribution-assigner.js';
import 'build/src/app/groups/group-member-list/group-member-list.js';
import 'build/src/app/groups/group-set-selector/group-set-selector.js';
import 'build/src/app/units/modals/unit-ilo-edit-modal/unit-ilo-edit-modal.js';
import 'build/src/app/units/modals/modals.js';
import 'build/src/app/units/units.js';
import 'build/src/app/units/states/tasks/inbox/inbox.js';
import 'build/src/app/units/states/tasks/tasks.js';
import 'build/src/app/units/states/tasks/definition/definition.js';
import 'build/src/app/units/states/portfolios/portfolios.js';
import 'build/src/app/units/states/groups/groups.js';
import 'build/src/app/units/states/states.js';
import 'build/src/app/units/states/edit/directives/unit-group-set-editor/unit-group-set-editor.js';
import 'build/src/app/units/states/edit/directives/unit-details-editor/unit-details-editor.js';
import 'build/src/app/units/states/edit/directives/unit-staff-editor/unit-staff-editor.js';
import 'build/src/app/units/states/edit/directives/unit-ilo-editor/unit-ilo-editor.js';
import 'build/src/app/units/states/edit/directives/directives.js';
import 'build/src/app/units/states/edit/edit.js';
import 'build/src/app/units/states/rollover/directives/unit-dates-selector/unit-dates-selector.js';
import 'build/src/app/units/states/rollover/directives/directives.js';
import 'build/src/app/units/states/rollover/rollover.js';
import 'build/src/app/units/states/index/index.js';
import 'build/src/app/units/states/students-list/students-list.js';
import 'build/src/app/units/states/analytics/analytics.js';
import 'build/src/app/common/filters/filters.js';
import 'build/src/app/common/content-editable/content-editable.js';
import 'build/src/app/common/modals/confirmation-modal/confirmation-modal.js';
import 'build/src/app/common/modals/comments-modal/comments-modal.js';
import 'build/src/app/common/modals/csv-result-modal/csv-result-modal.js';
import 'build/src/app/common/modals/modals.js';
import 'build/src/app/common/file-uploader/file-uploader.js';
import 'build/src/app/common/common.js';
import 'build/src/app/common/services/listener-service.js';
import 'build/src/app/common/services/outcome-service.js';
import 'build/src/app/common/services/services.js';
import 'build/src/app/common/services/recorder-service.js';
import 'build/src/app/common/services/media-service.js';
import 'build/src/app/common/services/analytics-service.js';
import 'build/src/app/common/services/date-service.js';
import 'build/src/app/sessions/auth/http-auth-injector.js';
import 'build/src/app/sessions/sessions.js';
import 'build/src/app/errors/errors.js';
import 'build/src/app/errors/states/timeout/timeout.js';
import 'build/src/app/errors/states/states.js';
import 'build/src/common/utilService/utilService.js';
import 'build/src/common/i18n/localize.js';
import 'build/src/i18n/resources-locale_default.js';
import 'build/src/i18n/resources-locale_en-US.js';
import 'build/src/i18n/resources-locale_en-AU.js';
import 'build/src/i18n/resources-locale_en-GB.js';
//#endregion

import {AboutDoubtfireModal} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import {ProjectTasksListComponent} from './tasks/project-tasks-list/project-tasks-list.component';
import {TaskCommentComposerComponent} from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {IntelligentDiscussionPlayerComponent} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import {ExtensionCommentComponent} from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import {TaskAssessmentCommentComponent} from './tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component';
import {ExtensionModalService} from './common/modals/extension-modal/extension-modal.service';
import {CalendarModalService} from './common/modals/calendar-modal/calendar-modal.service';
import {CampusListComponent} from './admin/institution-settings/campuses/campus-list/campus-list.component';
import {ActivityTypeListComponent} from './admin/institution-settings/activity-type-list/activity-type-list.component';
import {InstitutionSettingsComponent} from './admin/institution-settings/institution-settings.component';
import {CommentBubbleActionComponent} from './tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component';
import {UnitTutorialsListComponent} from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import {UnitTutorialsManagerComponent} from './units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component';
import {TutorialService} from './api/services/tutorial.service';
import {TutorialStreamService} from './api/services/tutorial-stream.service';
import {UnitStudentsEditorComponent} from './units/states/edit/directives/unit-students-editor/unit-students-editor.component';
import {CampusService} from './api/services/campus.service';
import {WebcalService} from './api/services/webcal.service';
import {StudentTutorialSelectComponent} from './units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';
import {StudentCampusSelectComponent} from './units/states/edit/directives/unit-students-editor/student-campus-select/student-campus-select.component';
import {EmojiService} from './common/services/emoji.service';
import {TaskListItemComponent} from './projects/states/dashboard/directives/student-task-list/task-list-item/task-list-item.component';
import {CreatePortfolioTaskListItemComponent} from './projects/states/dashboard/directives/student-task-list/create-portfolio-task-list-item/create-portfolio-task-list-item.component';
import {TaskDescriptionCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.component';
import {TaskCommentsViewerComponent} from './tasks/task-comments-viewer/task-comments-viewer.component';
import {UserIconComponent} from './common/user-icon/user-icon.component';
import {fPdfViewerComponent} from './common/pdf-viewer/pdf-viewer.component';
import {PdfViewerPanelComponent} from './common/pdf-viewer-panel/pdf-viewer-panel.component';
import {StaffTaskListComponent} from './units/states/tasks/inbox/directives/staff-task-list/staff-task-list.component';
import {StatusIconComponent} from './common/status-icon/status-icon.component';
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
import { UnauthorisedComponent } from './errors/states/unauthorised/unauthorised.component';
import { FileDownloaderService } from './common/file-downloader/file-downloader.service';
import { CheckForUpdateService } from './sessions/service-worker-updater/check-for-update.service';
import { TaskSubmissionService } from './common/services/task-submission.service';
import { TaskAssessmentModalService } from './common/modals/task-assessment-modal/task-assessment-modal.service';
import { TaskSubmissionHistoryComponent } from './tasks/task-submission-history/task-submission-history.component';
import { HeaderComponent } from './common/header/header.component';
import { SplashScreenComponent } from './home/splash-screen/splash-screen.component';
import { GlobalStateService } from './projects/states/index/global-state.service';
import { TransitionHooksService } from './sessions/transition-hooks.service';
import { GradeIconComponent } from './common/grade-icon/grade-icon.component';
import { GradeTaskModalService } from './tasks/modals/grade-task-modal/grade-task-modal.service';
import { AuthenticationService } from './api/services/authentication.service';
import { ProjectService } from './api/services/project.service';
import { ObjectSelectComponent } from './common/obect-select/object-select.component';
import { TaskDefinitionService } from './api/services/task-definition.service';
import { EditProfileDialogService } from './common/modals/edit-profile-dialog/edit-profile-dialog.service';
import { GroupService } from './api/services/group.service';
import { UserBadgeComponent } from './common/user-badge/user-badge.component';
import { TaskStatusCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.component';
import { TaskDueCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.component';
import { FooterComponent } from './common/footer/footer.component';
import { TaskAssessmentCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.component';
import { TaskSubmissionCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.component';
import { InboxComponent } from './units/states/tasks/inbox/inbox.component';
import { TaskDefinitionEditorComponent } from './units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-editor.component';
import { UnitAnalyticsComponent } from './units/states/analytics/unit-analytics-route.component';
import { UnitTaskEditorComponent } from './units/states/edit/directives/unit-tasks-editor/unit-task-editor.component';
import { CreateNewUnitModal } from './admin/modals/create-new-unit-modal/create-new-unit-modal.component';
import { FUsersComponent } from './admin/states/users/users.component';
import { FUnitTaskListComponent } from './units/task-viewer/directives/unit-task-list/unit-task-list.component';
import { FTaskDetailsViewComponent } from './units/task-viewer/directives/task-details-view/task-details-view.component';
import { FTaskSheetViewComponent } from './units/task-viewer/directives/task-sheet-view/task-sheet-view.component';
import { ProgressBurndownChartComponent } from './visualisations/progress-burndown-chart/progressburndownchart.component';
import { TaskVisualisationComponent } from './visualisations/task-visualisation/taskvisualisation.component';

import {FUnitsComponent} from './admin/states/units/units.component';
import {AlertService} from './common/services/alert.service';

import {GradeService} from './common/services/grade.service';
import {TaskScormCardComponent} from './projects/states/dashboard/directives/task-dashboard/directives/task-scorm-card/task-scorm-card.component';
import { UnitStudentEnrolmentModalService } from './units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.service';
import { PrivacyPolicy } from './config/privacy-policy/privacy-policy';

export const DoubtfireAngularJSModule = angular.module('doubtfire', [
  'doubtfire.config',
  'doubtfire.sessions',
  'doubtfire.common',
  'doubtfire.errors',
  'doubtfire.units',
  'doubtfire.tasks',
  'doubtfire.projects',
  'doubtfire.groups',
  'doubtfire.visualisations',
]);

// Downgrade angular modules that we need...
// factory -> service
DoubtfireAngularJSModule.factory('AboutDoubtfireModal', downgradeInjectable(AboutDoubtfireModal));
DoubtfireAngularJSModule.factory('DoubtfireConstants', downgradeInjectable(DoubtfireConstants));
DoubtfireAngularJSModule.factory('ExtensionModal', downgradeInjectable(ExtensionModalService));
DoubtfireAngularJSModule.factory('CalendarModal', downgradeInjectable(CalendarModalService));
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
DoubtfireAngularJSModule.factory('CreateNewUnitModal', downgradeInjectable(CreateNewUnitModal));
DoubtfireAngularJSModule.factory('GradeTaskModal', downgradeInjectable(GradeTaskModalService));
DoubtfireAngularJSModule.factory('UnitStudentEnrolmentModal', downgradeInjectable(UnitStudentEnrolmentModalService));
DoubtfireAngularJSModule.factory('PrivacyPolicy', downgradeInjectable(PrivacyPolicy));

// directive -> component
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
DoubtfireAngularJSModule.directive('newFUnits', downgradeComponent({component: FUnitsComponent}));

DoubtfireAngularJSModule.directive('unauthorised', downgradeComponent({ component: UnauthorisedComponent }));

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


DoubtfireAngularJSModule.directive(
  'fProgressBurndownChart',
  downgradeComponent({ component: ProgressBurndownChartComponent })
);

DoubtfireAngularJSModule.directive(
  'fTaskVisualisation',
  downgradeComponent({ component: TaskVisualisationComponent })
);
