// #
// # Doubtfire - A lightweight, modern learning management system
// #
// # Doubtfire is modularised into many modules, as indicated by the directory
// # tree inside app/
// #

import * as angular from 'angular';
import { downgradeInjectable, downgradeComponent } from '@angular/upgrade/static';

// Here are the old angular node modules, previously loaded via grunt
//#region
import 'node_modules/angular-cookies/angular-cookies.js';
import 'node_modules/angular-local-storage/dist/angular-local-storage.js';
import 'node_modules/angular-resource/angular-resource.js';
import 'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.js';
import 'node_modules/d3/d3.js';
import 'node_modules/angular-nvd3/dist/angular-nvd3.js';
import 'node_modules/angular-file-upload/angular-file-upload.js';
import 'node_modules/ng-file-upload/dist/ng-file-upload-all.min.js';
import 'node_modules/angular-sanitize/angular-sanitize.js';
import 'node_modules/ng-csv/build/ng-csv.js';
import 'node_modules/angular-xeditable/dist/js/xeditable.js';
import 'node_modules/angular-filter/dist/angular-filter.js';
import 'node_modules/angular-ui-codemirror/src/ui-codemirror.js';
import 'node_modules/angular-markdown-filter/markdown.js';
import 'node_modules/angulartics/dist/angulartics.min.js';
import 'node_modules/angulartics-google-analytics/lib/angulartics-google-analytics.js';
import 'node_modules/angular-md5/angular-md5.js';

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
import 'build/src/app/home/home.js';
import 'build/src/app/home/states/home/home.js';
import 'build/src/app/home/states/new-user-wizard/new-user-wizard.js';
import 'build/src/app/home/states/states.js';
import 'build/src/app/tasks/task-submission-viewer/task-submission-viewer.js';
import 'build/src/app/tasks/task-status-selector/task-status-selector.js';
import 'build/src/app/tasks/task-sheet-viewer/task-sheet-viewer.js';
import 'build/src/app/tasks/modals/upload-submission-modal/upload-submission-modal.js';
import 'build/src/app/tasks/modals/grade-task-modal/grade-task-modal.js';
import 'build/src/app/tasks/modals/modals.js';
import 'build/src/app/tasks/modals/plagiarism-report-modal/plagiarism-report-modal.js';
import 'build/src/app/tasks/task-definition-selector/task-definition-selector.js';
import 'build/src/app/tasks/tasks.js';
import 'build/src/app/tasks/task-feedback-assessor/task-feedback-assessor.js';
import 'build/src/app/tasks/task-plagiarism-report-viewer/task-plagiarism-report-viewer.js';
import 'build/src/app/tasks/task-plagiarism-file-viewer/task-plagiarism-file-viewer.js';
import 'build/src/app/tasks/project-tasks-list/project-tasks-list.js';
import 'build/src/app/tasks/task-ilo-alignment/task-ilo-alignment.js';
import 'build/src/app/tasks/task-ilo-alignment/task-ilo-alignment-rater/task-ilo-alignment-rater.js';
import 'build/src/app/tasks/task-ilo-alignment/modals/task-ilo-alignment.js';
import 'build/src/app/tasks/task-ilo-alignment/modals/task-ilo-alignment-modal/task-ilo-alignment-modal.js';
import 'build/src/app/tasks/task-ilo-alignment/task-ilo-alignment-editor/task-ilo-alignment-editor.js';
import 'build/src/app/tasks/task-ilo-alignment/task-ilo-alignment-viewer/task-ilo-alignment-viewer.js';
import 'build/src/app/tasks/task-definition-editor/task-definition-editor.js';
import 'build/src/app/tasks/task-submission-wizard/task-submission-wizard.js';
import 'build/src/app/config/privacy-policy/privacy-policy.js';
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
import 'build/src/app/projects/states/all/directives/directives.js';
import 'build/src/app/projects/states/all/directives/all-projects-list/all-projects-list.js';
import 'build/src/app/projects/states/all/all.js';
import 'build/src/app/projects/states/groups/groups.js';
import 'build/src/app/projects/states/feedback/feedback.js';
import 'build/src/app/projects/states/states.js';
import 'build/src/app/projects/states/dashboard/directives/progress-dashboard/progress-dashboard.js';
import 'build/src/app/projects/states/dashboard/directives/student-task-list/student-task-list.js';
import 'build/src/app/projects/states/dashboard/directives/directives.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/directives/task-outcomes-card/task-outcomes-card.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/directives/directives.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.js';
import 'build/src/app/projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.js';
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
import 'build/src/app/admin/modals/teaching-period-settings-modal/teaching-period-settings-modal.js';
import 'build/src/app/admin/modals/create-break-modal/create-break-modal.js';
import 'build/src/app/admin/modals/rollover-teaching-period-modal/rollover-teaching-period-modal.js';
import 'build/src/app/admin/modals/user-notification-settings-modal/user-notification-settings-modal.js';
import 'build/src/app/admin/modals/user-settings-modal/user-settings-modal.js';
import 'build/src/app/admin/modals/modals.js';
import 'build/src/app/admin/modals/create-unit-modal/create-unit-modal.js';
import 'build/src/app/admin/states/states.js';
import 'build/src/app/admin/states/units/units.js';
import 'build/src/app/admin/states/users/users.js';
import 'build/src/app/admin/states/teaching-periods/teaching-period-list/teaching-period-list.js';
import 'build/src/app/admin/states/teaching-periods/teaching-period-edit/directives/teaching-period-breaks/teaching-period-breaks.js';
import 'build/src/app/admin/states/teaching-periods/teaching-period-edit/directives/teaching-period-details-editor/teaching-period-details-editor.js';
import 'build/src/app/admin/states/teaching-periods/teaching-period-edit/directives/teaching-period-units/teaching-period-units.js';
import 'build/src/app/admin/states/teaching-periods/teaching-period-edit/directives/directives.js';
import 'build/src/app/admin/states/teaching-periods/teaching-period-edit/edit-teaching-period.js';
import 'build/src/app/admin/admin.js';
import 'build/src/app/groups/group-selector/group-selector.js';
import 'build/src/app/groups/group-set-manager/group-set-manager.js';
import 'build/src/app/groups/groups.js';
import 'build/src/app/groups/group-member-contribution-assigner/group-member-contribution-assigner.js';
import 'build/src/app/groups/group-member-list/group-member-list.js';
import 'build/src/app/groups/group-set-selector/group-set-selector.js';
import 'build/src/app/groups/tutor-group-manager/tutor-group-manager.js';
import 'build/src/app/groups/student-group-manager/student-group-manager.js';
import 'build/src/app/units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.js';
import 'build/src/app/units/modals/unit-ilo-edit-modal/unit-ilo-edit-modal.js';
import 'build/src/app/units/modals/modals.js';
import 'build/src/app/units/units.js';
import 'build/src/app/units/states/plagiarism/directives/unit-student-plagiarism-list/unit-student-plagiarism-list.js';
import 'build/src/app/units/states/plagiarism/directives/directives.js';
import 'build/src/app/units/states/plagiarism/plagiarism.js';
import 'build/src/app/units/states/tasks/inbox/directives/directives.js';
import 'build/src/app/units/states/tasks/inbox/inbox.js';
import 'build/src/app/units/states/tasks/tasks.js';
import 'build/src/app/units/states/tasks/viewer/directives/task-sheet-view/task-sheet-view.js';
import 'build/src/app/units/states/tasks/viewer/directives/task-details-view/task-details-view.js';
import 'build/src/app/units/states/tasks/viewer/directives/unit-task-list/unit-task-list.js';
import 'build/src/app/units/states/tasks/viewer/directives/directives.js';
import 'build/src/app/units/states/tasks/viewer/viewer.js';
import 'build/src/app/units/states/tasks/definition/definition.js';
import 'build/src/app/units/states/tasks/offline/offline.js';
import 'build/src/app/units/states/portfolios/portfolios.js';
import 'build/src/app/units/states/all/directives/all-units-list/all-units-list.js';
import 'build/src/app/units/states/all/directives/directives.js';
import 'build/src/app/units/states/all/all.js';
import 'build/src/app/units/states/groups/groups.js';
import 'build/src/app/units/states/states.js';
import 'build/src/app/units/states/edit/directives/unit-group-set-editor/unit-group-set-editor.js';
import 'build/src/app/units/states/edit/directives/unit-details-editor/unit-details-editor.js';
import 'build/src/app/units/states/edit/directives/unit-staff-editor/unit-staff-editor.js';
import 'build/src/app/units/states/edit/directives/unit-ilo-editor/unit-ilo-editor.js';
import 'build/src/app/units/states/edit/directives/directives.js';
import 'build/src/app/units/states/edit/directives/unit-tasks-editor/unit-tasks-editor.js';
import 'build/src/app/units/states/edit/edit.js';
import 'build/src/app/units/states/rollover/directives/unit-dates-selector/unit-dates-selector.js';
import 'build/src/app/units/states/rollover/directives/directives.js';
import 'build/src/app/units/states/rollover/rollover.js';
import 'build/src/app/units/states/index/index.js';
import 'build/src/app/units/states/students-list/students-list.js';
import 'build/src/app/units/states/analytics/directives/unit-achievement-stats/unit-achievement-stats.js';
import 'build/src/app/units/states/analytics/directives/task-status-stats/task-status-stats.js';
import 'build/src/app/units/states/analytics/directives/unit-stats-download/unit-stats-download.js';
import 'build/src/app/units/states/analytics/directives/task-completion-stats/task-completion-stats.js';
import 'build/src/app/units/states/analytics/directives/directives.js';
import 'build/src/app/units/states/analytics/directives/unit-target-grade-stats/unit-target-grade-stats.js';
import 'build/src/app/units/states/analytics/analytics.js';
import 'build/src/app/common/filters/filters.js';
import 'build/src/app/common/long-press/on-long-press.js';
import 'build/src/app/common/content-editable/content-editable.js';
import 'build/src/app/common/alert-list/alert-list.js';
import 'build/src/app/common/modals/confirmation-modal/confirmation-modal.js';
import 'build/src/app/common/modals/comments-modal/comments-modal.js';
import 'build/src/app/common/modals/csv-result-modal/csv-result-modal.js';
import 'build/src/app/common/modals/progress-modal/progress-modal.js';
import 'build/src/app/common/modals/modals.js';
import 'build/src/app/common/grade-icon/grade-icon.js';
import 'build/src/app/common/file-uploader/file-uploader.js';
import 'build/src/app/common/common.js';
import 'build/src/app/common/header/header.js';
import 'build/src/app/common/header/unit-dropdown/unit-dropdown.js';
import 'build/src/app/common/services/task-service.js';
import 'build/src/app/common/services/listener-service.js';
import 'build/src/app/common/services/outcome-service.js';
import 'build/src/app/common/services/services.js';
import 'build/src/app/common/services/group-service.js';
import 'build/src/app/common/services/recorder-service.js';
import 'build/src/app/common/services/project-service.js';
import 'build/src/app/common/services/media-service.js';
import 'build/src/app/common/services/analytics-service.js';
import 'build/src/app/common/services/grade-service.js';
import 'build/src/app/common/services/alert-service.js';
import 'build/src/app/common/services/unit-service.js';
import 'build/src/app/common/services/header-service.js';
import 'build/src/app/common/services/date-service.js';
import 'build/src/app/sessions/auth/auth.js';
import 'build/src/app/sessions/auth/roles/roles.js';
import 'build/src/app/sessions/auth/roles/if-role.js';
import 'build/src/app/sessions/auth/http-auth-injector.js';
import 'build/src/app/sessions/sessions.js';
import 'build/src/app/sessions/current-user/current-user.js';
import 'build/src/app/sessions/states/states.js';
import 'build/src/app/sessions/states/sign-in/sign-in.js';
import 'build/src/app/sessions/states/sign-out/sign-out.js';
import 'build/src/app/sessions/cookies/cookies.js';
import 'build/src/app/api/models/unit-role.js';
import 'build/src/app/api/models/group-member.js';
import 'build/src/app/api/models/user-role.js';
import 'build/src/app/api/models/learning-alignments.js';
import 'build/src/app/api/models/intended-learning-outcome.js';
import 'build/src/app/api/models/task-comment.js';
import 'build/src/app/api/models/group-set.js';
import 'build/src/app/api/models/task-completion-csv.js';
import 'build/src/app/api/models/user.js';
import 'build/src/app/api/models/rollover-unit.js';
import 'build/src/app/api/models/task.js';
import 'build/src/app/api/models/task-alignment.js';
import 'build/src/app/api/models/models.js';
import 'build/src/app/api/models/tutorial.js';
import 'build/src/app/api/models/task-similarity.js';
import 'build/src/app/api/models/students.js';
import 'build/src/app/api/models/convenor.js';
import 'build/src/app/api/models/break.js';
import 'build/src/app/api/models/portfolion-submission.js';
import 'build/src/app/api/models/tutor.js';
import 'build/src/app/api/models/project.js';
import 'build/src/app/api/models/task-feedback.js';
import 'build/src/app/api/models/task-definition.js';
import 'build/src/app/api/models/teaching-period.js';
import 'build/src/app/api/models/group.js';
import 'build/src/app/api/models/unit.js';
import 'build/src/app/api/api.js';
import 'build/src/app/api/resource-plus.js';
import 'build/src/app/errors/errors.js';
import 'build/src/app/errors/states/unauthorised/unauthorised.js';
import 'build/src/app/errors/states/not-found/not-found.js';
import 'build/src/app/errors/states/timeout/timeout.js';
import 'build/src/app/errors/states/states.js';
import 'build/src/common/utilService/utilService.js';
import 'build/src/common/i18n/localize.js';
import 'build/src/i18n/resources-locale_default.js';
import 'build/src/i18n/resources-locale_en-US.js';
import 'build/src/i18n/resources-locale_en-AU.js';
import 'build/src/i18n/resources-locale_en-GB.js';
//#endregion

import { AboutDoubtfireModal } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import { TaskCommentComposerComponent } from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import {
  IntelligentDiscussionPlayerComponent
} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import { ExtensionCommentComponent } from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import { ExtensionModalService } from './common/modals/extension-modal/extension-modal.service';
import { CalendarModalService } from './common/modals/calendar-modal/calendar-modal.service';
import { CampusListComponent } from './admin/states/campuses/campus-list/campus-list.component';
import { ActivityTypeListComponent } from './admin/states/activities/activity-type-list/activity-type-list.component';
import { InstitutionSettingsComponent } from './units/states/institution-settings/institution-settings.component';
import { CommentBubbleActionComponent } from './tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component';
import { TaskCommentService } from './common/services/task-comment.service';
import { UnitTutorialsListComponent } from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import { UnitTutorialsManagerComponent } from './units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component';
import { TutorialService } from './api/models/tutorial/tutorial.service';
import { TutorialStreamService } from './api/models/tutorial-stream/tutorial-stream.service';
import { UnitStudentsEditorComponent } from './units/states/edit/directives/unit-students-editor/unit-students-editor.component';
import { CampusService } from './api/models/campus/campus.service';
import { WebcalService } from './api/models/webcal/webcal.service';
import { StudentTutorialSelectComponent } from './units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';
import { StudentCampusSelectComponent } from './units/states/edit/directives/unit-students-editor/student-campus-select/student-campus-select.component';
import { EmojiService } from './common/services/emoji.service';
import { TaskListItemComponent } from './projects/states/dashboard/directives/student-task-list/task-list-item/task-list-item.component';
import { CreatePortfolioTaskListItemComponent } from './projects/states/dashboard/directives/student-task-list/create-portfolio-task-list-item/create-portfolio-task-list-item.component';
import { TaskCommentsViewerComponent } from './tasks/task-comments-viewer/task-comments-viewer.component';
import { UserIconComponent } from './common/user-icon/user-icon.component';
import { PdfViewerComponent } from './common/pdf-viewer/pdf-viewer.component';
import { PdfViewerPanelComponent } from './common/pdf-viewer-panel/pdf-viewer-panel.component';
import { StaffTaskListComponent } from './units/states/tasks/inbox/directives/staff-task-list/staff-task-list.component';
import { StatusIconComponent } from './common/status-icon/status-icon.component';
import { TaskPlagiarismCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-plagiarism-card/task-plagiarism-card.component';

export const DoubtfireAngularJSModule = angular.module('doubtfire', [
  'doubtfire.config',
  'doubtfire.api',
  'doubtfire.sessions',
  'doubtfire.common',
  'doubtfire.errors',
  'doubtfire.home',
  'doubtfire.admin',
  'doubtfire.units',
  'doubtfire.tasks',
  'doubtfire.projects',
  'doubtfire.groups',
  'doubtfire.visualisations']);

// Downgrade angular modules that we need...
// factory -> service
DoubtfireAngularJSModule.factory('AboutDoubtfireModal',
  downgradeInjectable(AboutDoubtfireModal));
DoubtfireAngularJSModule.factory('DoubtfireConstants',
  downgradeInjectable(DoubtfireConstants));
DoubtfireAngularJSModule.factory('ExtensionModal',
  downgradeInjectable(ExtensionModalService));
DoubtfireAngularJSModule.factory('CalendarModal',
  downgradeInjectable(CalendarModalService));
DoubtfireAngularJSModule.factory('TaskCommentService',
  downgradeInjectable(TaskCommentService));
DoubtfireAngularJSModule.factory('tutorialService',
  downgradeInjectable(TutorialService));
DoubtfireAngularJSModule.factory('streamService',
  downgradeInjectable(TutorialStreamService));
DoubtfireAngularJSModule.factory('campusService',
  downgradeInjectable(CampusService));
DoubtfireAngularJSModule.factory('webcalService',
  downgradeInjectable(WebcalService));
DoubtfireAngularJSModule.factory('emojiService',
  downgradeInjectable(EmojiService));

// directive -> component
DoubtfireAngularJSModule.directive('taskCommentComposer',
  downgradeComponent({ component: TaskCommentComposerComponent }));
DoubtfireAngularJSModule.directive('intelligentDiscussionPlayer',
  downgradeComponent({ component: IntelligentDiscussionPlayerComponent }));
DoubtfireAngularJSModule.directive('extensionComment',
  downgradeComponent({ component: ExtensionCommentComponent }));
DoubtfireAngularJSModule.directive('campusList',
  downgradeComponent({ component: CampusListComponent }));
DoubtfireAngularJSModule.directive('activityTypeList',
  downgradeComponent({ component: ActivityTypeListComponent }));
DoubtfireAngularJSModule.directive('institutionSettings',
  downgradeComponent({ component: InstitutionSettingsComponent }));
DoubtfireAngularJSModule.directive('commentBubbleAction',
  downgradeComponent({ component: CommentBubbleActionComponent }));
DoubtfireAngularJSModule.directive('unitTutorialsList',
  downgradeComponent({ component: UnitTutorialsListComponent }));
DoubtfireAngularJSModule.directive('unitTutorialsManager',
  downgradeComponent({ component: UnitTutorialsManagerComponent }));
DoubtfireAngularJSModule.directive('unitStudentsEditor',
  downgradeComponent({ component: UnitStudentsEditorComponent }));
DoubtfireAngularJSModule.directive('studentTutorialSelect',
  downgradeComponent({ component: StudentTutorialSelectComponent }));
DoubtfireAngularJSModule.directive('studentCampusSelect',
  downgradeComponent({ component: StudentCampusSelectComponent }));
DoubtfireAngularJSModule.directive('taskListItem',
  downgradeComponent({ component: TaskListItemComponent }));
DoubtfireAngularJSModule.directive('createPortfolioTaskListItem',
  downgradeComponent({ component: CreatePortfolioTaskListItemComponent }));

  // Global configuration
DoubtfireAngularJSModule.directive('taskCommentsViewer',
  downgradeComponent({ component: TaskCommentsViewerComponent }));
DoubtfireAngularJSModule.directive('userIcon',
  downgradeComponent({ component: UserIconComponent }));
DoubtfireAngularJSModule.directive('pdfViewer',
  downgradeComponent({ component: PdfViewerComponent }));
DoubtfireAngularJSModule.directive('pdfViewerPanel',
  downgradeComponent({ component: PdfViewerPanelComponent }));
DoubtfireAngularJSModule.directive('staffTaskList',
  downgradeComponent({ component: StaffTaskListComponent }));
DoubtfireAngularJSModule.directive('statusIcon',
  downgradeComponent({ component: StatusIconComponent }));
DoubtfireAngularJSModule.directive('taskPlagiarismCard',
  downgradeComponent({ component: TaskPlagiarismCardComponent }));
// Global configuration

// If the user enters a URL that doesn't match any known URL (state), send them to `/home`
const otherwiseConfigBlock = ['$urlRouterProvider', '$locationProvider', ($urlRouterProvider: any, $locationProvider: any) => {
  $locationProvider.hashPrefix('');
  $urlRouterProvider.otherwise('/home');
}];
DoubtfireAngularJSModule.config(otherwiseConfigBlock);
