import {Routes} from '@angular/router';
import {EditProfileComponent} from './account/edit-profile/edit-profile.component';
import {InstitutionSettingsComponent} from './admin/institution-settings/institution-settings.component';
import {FUnitsComponent} from './admin/states/units/units.component';
import {FUsersComponent} from './admin/states/users/users.component';
import {roleWhitelistGuard} from './common/guards/role-whitelist.guard';
import {ScormPlayerComponent} from './common/scorm-player/scorm-player.component';
import {SubmissionFilesDownloadComponent} from './common/submission-files-download/submission-files-download.component';
import {SuccessCloseComponent} from './common/success-close/success-close.component';
import {TimeoutComponent} from './errors/states/timeout/timeout.component';
import {UnauthorisedComponent} from './errors/states/unauthorised/unauthorised.component';
import {AcceptEulaComponent} from './eula/accept-eula/accept-eula.component';
import {HomeComponent} from './home/states/home/home.component';
import {LtiDashboardComponent} from './home/states/lti-dashboard/lti-dashboard.component';
import {LtiUnitLinkComponent} from './home/states/lti-unit-link/lti-unit-link.component';
import {resolveProject} from './projects/project.resolver';
import {UnitContentViewerComponent} from './projects/states/content/unit-content-viewer.component';
import {ProjectDashboardComponent} from './projects/states/dashboard/project-dashboard/project-dashboard.component';
import {ProjectGroupsStateComponent} from './projects/states/groups/project-groups-state.component';
import {JplagReportViewerComponent} from './projects/states/jplag/jplag-report-viewer.component';
import {ProjectPlanComponent} from './projects/states/plan/project-plan.component';
import {PortfolioStateComponent} from './projects/states/portfolio/portfolio-state.component';
import {ProjectRootStateComponent} from './projects/states/project-root-state.component';
import {TutorDiscussionComponent} from './projects/states/tutor-discussion/tutor-discussion.component';
import {TutorialsComponent} from './projects/states/tutorials/tutorials.component';
import {SignInComponent} from './sessions/states/sign-in/sign-in.component';
import {UnitAnalyticsComponent} from './units/states/analytics/unit-analytics-route.component';
import {UnitAdminStateComponent} from './units/states/edit/unit-admin-state.component';
import {UnitGroupsComponent} from './units/states/groups/unit-groups/unit-groups.component';
import {PortfoliosComponent} from './units/states/portfolios/portfolios.component';
import {RolloverComponent} from './units/states/rollover/rollover.component';
import {StudentsListComponent} from './units/states/students-list/students-list.component';
import {UnitTaskInboxStateComponent} from './units/states/tasks/inbox/unit-task-inbox-state.component';
import {TaskViewerStateComponent} from './units/task-viewer/task-viewer-state.component';
import {resolveUnitCodeContent} from './units/unit-code-content.guard';
import {UnitRootStateComponent} from './units/unit-root-state.component';
import {resolveUnit} from './units/unit.resolver';
import {WelcomeComponent} from './welcome/welcome.component';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: HomeComponent},
  {path: 'sign_in', component: SignInComponent},
  {path: 'welcome', component: WelcomeComponent},
  {path: 'unauthorised', component: UnauthorisedComponent},
  {path: 'timeout', component: TimeoutComponent},
  {path: 'success-close', component: SuccessCloseComponent},
  {path: 'edit_profile', component: EditProfileComponent},
  {path: 'eula', component: AcceptEulaComponent},
  {path: 'lti', component: LtiDashboardComponent},
  {path: 'lti/link', component: LtiUnitLinkComponent},
  {path: 'jplag-report-viewer', component: JplagReportViewerComponent},
  {
    path: 'projects/:projectId/task_def_id/:taskDefId/scorm-player/normal',
    component: ScormPlayerComponent,
    data: {mode: 'normal'},
  },
  {
    path: 'projects/:projectId/task_def_id/:taskDefId/scorm-player/review/:testAttemptId',
    component: ScormPlayerComponent,
    data: {mode: 'review'},
  },
  {
    path: 'task_def_id/:taskDefId/preview-scorm',
    component: ScormPlayerComponent,
    data: {mode: 'preview'},
  },
  {
    path: 'projects/:projectId/task_def_id/:taskDefId/submission_files/download',
    component: SubmissionFilesDownloadComponent,
  },
  {path: 'view-all-units', component: FUnitsComponent, data: {mode: 'tutor'}},
  {path: 'view-all-projects', component: FUnitsComponent, data: {mode: 'student'}},
  {
    path: 'admin/units',
    component: FUnitsComponent,
    canActivate: [roleWhitelistGuard],
    data: {mode: 'admin', roleWhitelist: ['Admin', 'Auditor', 'Convenor']},
  },
  {
    path: 'admin/users',
    component: FUsersComponent,
    canActivate: [roleWhitelistGuard],
    data: {roleWhitelist: ['Admin', 'Auditor']},
  },
  {
    path: 'admin/institution-settings',
    component: InstitutionSettingsComponent,
    canActivate: [roleWhitelistGuard],
    data: {roleWhitelist: ['Admin', 'Auditor']},
  },
  {
    path: 'admin/institution-settings/:tab',
    component: InstitutionSettingsComponent,
    canActivate: [roleWhitelistGuard],
    data: {roleWhitelist: ['Admin', 'Auditor']},
  },
  {
    path: 'tutor-discussion',
    component: TutorDiscussionComponent,
    canActivate: [roleWhitelistGuard],
    data: {task: 'Discussion', roleWhitelist: ['Admin', 'Auditor', 'Tutor']},
  },
  {
    path: 'tutor-attendance',
    component: TutorDiscussionComponent,
    data: {attendance: true, task: 'Check-in'},
  },
  {
    path: ':unitCode/content',
    component: UnitContentViewerComponent,
    canActivate: [resolveUnitCodeContent],
  },
  {
    path: 'units',
    children: [
      {path: '', pathMatch: 'full', redirectTo: '/home'},
      {
        path: ':unitId',
        component: UnitRootStateComponent,
        resolve: {
          unit: resolveUnit,
        },
        children: [
          {path: '', pathMatch: 'full', redirectTo: 'tasks/inbox'},
          {path: 'analytics', component: UnitAnalyticsComponent, data: {task: 'Unit Analytics'}},
          {path: 'students/groups', component: UnitGroupsComponent, data: {task: 'Student Groups'}},
          {
            path: 'students/portfolios',
            component: PortfoliosComponent,
            data: {task: 'Student Portfolios'},
          },
          {
            path: 'students/portfolios/:projectId',
            component: PortfoliosComponent,
            data: {task: 'Student Portfolios'},
          },
          {
            path: 'students/portfolios/:projectId/:tab',
            component: PortfoliosComponent,
            data: {task: 'Student Portfolios'},
          },
          {
            path: 'students/portfolios/:projectId/:tab/:taskAbbreviation',
            component: PortfoliosComponent,
            data: {task: 'Student Portfolios'},
          },
          {path: 'students', component: StudentsListComponent, data: {task: 'Student List'}},
          {
            path: 'content',
            component: UnitContentViewerComponent,
            data: {task: 'Unit Content'},
          },
          {
            path: 'admin',
            component: UnitAdminStateComponent,
            canActivate: [roleWhitelistGuard],
            data: {task: 'Unit Administration', roleWhitelist: ['Convenor', 'Admin', 'Auditor']},
          },
          {
            path: 'admin/:tab',
            component: UnitAdminStateComponent,
            canActivate: [roleWhitelistGuard],
            data: {task: 'Unit Administration', roleWhitelist: ['Convenor', 'Admin', 'Auditor']},
          },
          {path: 'rollover', component: RolloverComponent, data: {task: 'Unit Rollover'}},
          {path: 'discussion', component: TutorDiscussionComponent, data: {task: 'Discussion'}},
          {
            path: 'check-in',
            component: TutorDiscussionComponent,
            data: {attendance: true, task: 'Check-in'},
          },
          {
            path: 'tasks',
            pathMatch: 'full',
            component: TaskViewerStateComponent,
            data: {task: 'Task Lists', roleWhitelist: ['Convenor', 'Admin', 'Auditor']},
            canActivate: [roleWhitelistGuard],
          },
          {
            path: 'tasks',
            canActivate: [roleWhitelistGuard],
            data: {roleWhitelist: ['Convenor', 'Admin', 'Auditor', 'Tutor']},

            children: [
              {path: '', pathMatch: 'full', redirectTo: 'inbox'},
              {
                path: 'inbox',
                component: UnitTaskInboxStateComponent,
                data: {routeMode: 'inbox', task: 'Task Inbox'},
              },
              {
                path: 'inbox/:studentId/:taskDefAbbr',
                component: UnitTaskInboxStateComponent,
                data: {routeMode: 'inbox', task: 'Task Inbox'},
              },
              {
                path: 'definition',
                component: UnitTaskInboxStateComponent,
                data: {routeMode: 'definition', task: 'Task Explorer'},
              },
              {
                path: 'definition/:studentId/:taskDefAbbr',
                component: UnitTaskInboxStateComponent,
                data: {routeMode: 'definition', task: 'Task Explorer'},
              },
              {
                path: 'moderation',
                component: UnitTaskInboxStateComponent,
                data: {routeMode: 'moderation', task: 'Task Moderation'},
              },
              {
                path: 'moderation/:studentId/:taskDefAbbr',
                component: UnitTaskInboxStateComponent,
                data: {routeMode: 'moderation', task: 'Task Moderation'},
              },
              {
                path: 'overflow',
                component: UnitTaskInboxStateComponent,
                data: {routeMode: 'overflow', task: 'Task Overflow'},
              },
              {
                path: 'overflow/:studentId/:taskDefAbbr',
                component: UnitTaskInboxStateComponent,
                data: {routeMode: 'overflow', task: 'Task Overflow'},
              },
            ],
          },
          {
            path: 'tasks/:taskAbbreviation',
            component: TaskViewerStateComponent,
            data: {task: 'Task Lists'},
          },
        ],
      },
    ],
  },
  {
    path: 'projects',
    children: [
      {path: '', pathMatch: 'full', redirectTo: '/home'},
      {
        path: ':projectId',
        component: ProjectRootStateComponent,
        resolve: {
          project: resolveProject,
        },
        children: [
          {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
          {
            path: 'dashboard',
            component: ProjectDashboardComponent,
            data: {task: 'Dashboard'},
          },
          {
            path: 'dashboard/:taskAbbreviation',
            component: ProjectDashboardComponent,
            data: {task: 'Dashboard'},
          },
          {path: 'plan', component: ProjectPlanComponent, data: {task: 'Plan Tasks'}},
          {
            path: 'portfolio',
            component: PortfolioStateComponent,
            data: {task: 'Portfolio Creation'},
          },
          {path: 'groups', component: ProjectGroupsStateComponent, data: {task: 'Groups List'}},
          {path: 'tutorials', component: TutorialsComponent, data: {task: 'Tutorial List'}},
        ],
      },
    ],
  },
  {path: '**', redirectTo: 'home'},
];
