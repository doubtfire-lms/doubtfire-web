import {NgHybridStateDeclaration} from '@uirouter/angular-hybrid';
import {InstitutionSettingsComponent} from './admin/institution-settings/institution-settings.component';
import {HomeComponent} from './home/states/home/home.component';
import {WelcomeComponent} from './welcome/welcome.component';
import {SignInComponent} from './sessions/states/sign-in/sign-in.component';
import {EditProfileComponent} from './account/edit-profile/edit-profile.component';
import {TeachingPeriodListComponent} from './admin/states/teaching-periods/teaching-period-list/teaching-period-list.component';
import {AcceptEulaComponent} from './eula/accept-eula/accept-eula.component';
import {FUsersComponent} from './admin/states/f-users/f-users.component';
import {FUnitsComponent} from './admin/states/f-units/f-units.component';
import {ScormPlayerComponent} from './common/scorm-player/scorm-player.component';
import {TutorDiscussionComponent} from './projects/states/tutor-discussion/tutor-discussion.component';
import {SuccessCloseComponent} from './common/success-close/success-close.component';
import {ProjectPlanComponent} from './projects/states/plan/project-plan.component';
import {JplagReportViewerComponent} from './projects/states/jplag/jplag-report-viewer.component';
import {LtiDashboardComponent} from './home/states/lti-dashboard/lti-dashboard.component';
import {LtiUnitLinkComponent} from './home/states/lti-unit-link/lti-unit-link.component';
import {TimeoutComponent} from './errors/states/timeout/timeout.component';
/*
 * Use this file to store any states that are sourced by angular components.
 */

/**
 * Define the institution settings state - used to edit campus data.
 */
const institutionSettingsState: NgHybridStateDeclaration = {
  name: 'institutionsettings', // This is the name of the state to jump to - so ui-sref="institutionsettings" to jump here
  url: '/admin/institution-settings', // You get here with this url
  views: {
    main: {
      // Main body links to angular component
      component: InstitutionSettingsComponent,
    },
  },
  data: {
    pageTitle: 'Institution Settings',
    roleWhiteList: ['Admin'],
  },
};

const usersState: NgHybridStateDeclaration = {
  name: 'admin/users', // This is the name of the state to jump to - so ui-sref="users" to jump here
  url: '/admin/users', // You get here with this url
  views: {
    main: {
      // Main body links to angular component
      component: FUsersComponent,
    },
  },
  data: {
    pageTitle: 'Administer users',
    roleWhiteList: ['Admin'],
  },
};

/**
 * Define the new home state.
 */
const HomeState: NgHybridStateDeclaration = {
  name: 'home',
  url: '/home',
  views: {
    main: {
      component: HomeComponent,
    },
  },
  data: {
    pageTitle: 'Home Page',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

// const unitParentState: NgHybridStateDeclaration = {
//   name: 'units',
//   url: '/units/:unit_id',
//   // template for the parent state
//   views: {
//     main: {
//       component: IndexComponent,
//     },
//   },
//   resolve: {
//     unit: function ($stateParams) {
//       const unitService = AppInjector.get(UnitService);
//       const globalState = AppInjector.get(GlobalStateService);
//       globalState.onLoad(() => {});
//       console.log($stateParams);
//       unitService.query({ id: $stateParams.unit_id }).subscribe((unit) => {
//         console.log($stateParams.unit_id);
//         console.log(unit);
//         return unit;
//       });
//     },
//     unitRole: function ($stateParams) {
//       const globalStateService = AppInjector.get(GlobalStateService);

//       globalStateService.unitRolesSubject.subscribe((unitRoles) => {
//         return unitRoles.find((unitRole) => unitRole.id === $stateParams.unit_id);
//       });
//     },
//   },
// };

/**
 * Define the new home state.
 */
// const InboxState: NgHybridStateDeclaration = {
//   name: 'inbox',
//   url: '/units/:unit_id/inbox/:task_key',

//   params: {
//     // unitRole: UnitRole,
//     // taskKey: null,
//     // taskData:
//     // unit,
//   },
//   views: {
//     main: {
//       component: InboxComponent,
//     },
//   },
//   data: {
//     task: 'Task Inbox',
//     pageTitle: '_Home_',
//     roleWhitelist: ['Tutor', 'Convenor', 'Admin'],
//   },
//   resolve: {
//     unit$: function ($stateParams) {
//       const unitService = AppInjector.get(UnitService);
//       const globalState = AppInjector.get(GlobalStateService);
//       globalState.onLoad(() => {});
//       console.log($stateParams);
//       return unitService.get({ id: $stateParams.unit_id });
//     },
//     unitRole$: function ($stateParams) {
//       const globalStateService = AppInjector.get(GlobalStateService);

//       const result = globalStateService.loadedUnitRoles.values.pipe(
//         map((unitRoles) => unitRoles.find((unitRole) => unitRole.id == $stateParams.unit_id))
//       );
//       return result;
//     },
//     taskData$: function () {
//       const taskService = AppInjector.get(TaskService);
//       const taskData = {
//         taskKey: null,
//         source: null,
//         selectedTask: null,
//         onSelectedTaskChange: (task) =>{
//           const taskKey = task?.taskKey()
//           $scope.taskData.taskKey = taskKey
//           setTaskKeyAsUrlParams(task);
//         }
//       }
//       taskData.source = taskService.queryTasksForTaskInbox.bind(taskService);
//       taskData.taskDefMode = false;
//       return of(taskData);
//     },
//   },
// };

/**
 * Define the welcome state.
 */
const WelcomeState: NgHybridStateDeclaration = {
  name: 'welcome',
  url: '/welcome',
  views: {
    main: {
      component: WelcomeComponent,
    },
  },
  data: {
    pageTitle: 'Welcome',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

/**
 * Define the Sign In state.
 */
const SignInState: NgHybridStateDeclaration = {
  name: 'sign_in',
  url: '/sign_in?authToken&username',
  views: {
    main: {
      component: SignInComponent,
    },
  },
  data: {
    pageTitle: 'Sign In',
  },
  resolve: {
    username: [
      '$stateParams',
      function ($stateParams: {username: string}) {
        return $stateParams.username;
      },
    ],
    authToken: [
      '$stateParams',
      function ($stateParams: {authToken: string}) {
        return $stateParams.authToken;
      },
    ],
  },
};

/**
 * Define the Edit Profile state.
 */
const EditProfileState: NgHybridStateDeclaration = {
  name: 'edit_profile',
  url: '/edit_profile',
  views: {
    main: {
      component: EditProfileComponent,
    },
  },
  data: {
    pageTitle: 'Edit Profile',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

const TeachingPeriodsState: NgHybridStateDeclaration = {
  name: 'teaching_periods',
  url: '/admin/teachingperiods',
  views: {
    main: {
      component: TeachingPeriodListComponent,
    },
  },
  data: {
    pageTitle: 'Teaching Periods',
    roleWhitelist: ['Convenor', 'Admin'],
  },
};

const EulaState: NgHybridStateDeclaration = {
  name: 'eula',
  url: '/eula',
  views: {
    main: {
      component: AcceptEulaComponent,
    },
  },
  data: {
    pageTitle: 'End User License Agreement',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

const ViewAllProjectsState: NgHybridStateDeclaration = {
  name: 'view-all-projects',
  url: '/view-all-projects',
  resolve: {
    'mode': function () {
      return 'student';
    },
  },
  views: {
    main: {
      component: FUnitsComponent,
    },
  },
  data: {
    pageTitle: 'Teaching Periods',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin'],
  },
};

const AdministerUnits: NgHybridStateDeclaration = {
  name: 'admin/units', // This is the name of the state to jump to - so ui-sref="users" to jump here
  url: '/admin/units', // You get here with this url
  resolve: {
    'mode': function () {
      return 'admin';
    },
  },
  views: {
    main: {
      // Main body links to angular component
      component: FUnitsComponent,
    },
  },
  data: {
    pageTitle: 'Administer units',
    roleWhiteList: ['Admin'],
  },
};

const ViewAllUnits: NgHybridStateDeclaration = {
  name: 'view-all-units',
  url: '/view-all-units',
  // passes 'mode' as @Input to the component
  resolve: {
    'mode': function () {
      return 'tutor';
    },
  },
  views: {
    main: {
      component: FUnitsComponent,
    },
  },
  data: {
    pageTitle: 'Teaching Periods',
    mode: 'tutor',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin'],
  },
};

/**
 * Define the SCORM Player state.
 */
const ScormPlayerNormalState: NgHybridStateDeclaration = {
  name: 'scorm-player-normal',
  url: '/projects/:project_id/task_def_id/:task_definition_id/scorm-player/normal',
  resolve: {
    projectId: [
      '$stateParams',
      function ($stateParams: {project_id: number}) {
        return $stateParams.project_id;
      },
    ],
    taskDefId: [
      '$stateParams',
      function ($stateParams: {task_definition_id: number}) {
        return $stateParams.task_definition_id;
      },
    ],
    mode: function () {
      return 'normal';
    },
  },
  views: {
    main: {
      component: ScormPlayerComponent,
    },
  },
  data: {
    pageTitle: 'Knowledge Check',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin'],
  },
};

/**
 * Define the SCORM Player state.
 */
const ScormPlayerStudentReviewState: NgHybridStateDeclaration = {
  name: 'scorm-player-student-review',
  url: '/projects/:project_id/task_def_id/:task_definition_id/scorm-player/review/:test_attempt_id',
  resolve: {
    projectId: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.project_id;
      },
    ],
    taskDefId: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.task_definition_id;
      },
    ],
    testAttemptId: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.test_attempt_id;
      },
    ],
    mode: function () {
      return 'review';
    },
  },
  views: {
    main: {
      component: ScormPlayerComponent,
    },
  },
  data: {
    pageTitle: 'Review Knowledge Check',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin'],
  },
};

const ScormPlayerReviewState: NgHybridStateDeclaration = {
  name: 'scorm-preview',
  url: '/task_def_id/:task_definition_id/preview-scorm',
  resolve: {
    taskDefId: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.task_definition_id;
      },
    ],
    mode: function () {
      return 'preview';
    },
  },
  views: {
    main: {
      component: ScormPlayerComponent,
    },
  },
  data: {
    pageTitle: 'Preview Scorm Test',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin'],
  },
};

const SuccessCloseState: NgHybridStateDeclaration = {
  name: 'success-close',
  url: '/success-close',
  views: {
    main: {
      component: SuccessCloseComponent,
    },
  },
  data: {
    pageTitle: 'Home Page',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

/**
 * Allow the uesr to plan the task due dates for their project.
 */
const projectPlanState: NgHybridStateDeclaration = {
  name: 'project/plan',
  parent: 'projects/index',
  url: '/plan?:taskDef?',
  component: ProjectPlanComponent,
  params: {
    taskDef: {value: null, squash: true, dynamic: true},
  },
  // views: {
  //   main: {
  //     // Main body links to angular component
  //     component: ProjectPlanComponent,
  //   },
  // },
  data: {
    pageTitle: 'Task Plan',
    task: 'Plan Tasks',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

const TutorDiscussionState: NgHybridStateDeclaration = {
  name: 'tutor-discussion',
  url: '/tutor-discussion?unitId&username',
  views: {
    main: {
      component: TutorDiscussionComponent,
    },
  },
  resolve: {
    unitId: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.unitId;
      },
    ],
    username: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.username;
      },
    ],
  },
  data: {
    pageTitle: 'Discussion',
    task: 'Discussion',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

const TutorAttendance: NgHybridStateDeclaration = {
  name: 'tutor-attendance',
  url: '/tutor-attendance?unitId&attendance',
  resolve: {
    unitId: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.unitId;
      },
    ],
    attendance: [
      '$stateParams',
      function ($stateParams) {
        if ($stateParams.attendance == 'true' || $stateParams.attendance === true) {
          return true;
        }
        return false;
      },
    ],
  },
  views: {
    main: {
      component: TutorDiscussionComponent,
    },
  },
  data: {
    pageTitle: 'Check-in',
    task: 'Check-in',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

const jplagReportViewerState: NgHybridStateDeclaration = {
  name: 'jplag-report-viewer',
  url: '/jplag-report-viewer',
  views: {
    main: {
      component: JplagReportViewerComponent,
    },
  },
  data: {
    pageTitle: 'JPlag Report Viewer',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

// Lti States

/**
 * Define the LTI dashboard state.
 */
const LtiDashboardState: NgHybridStateDeclaration = {
  name: 'lti',
  url: '/lti?ltik',
  resolve: {
    ltik: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.ltik;
      },
    ],
  },
  views: {
    main: {
      component: LtiDashboardComponent,
    },
  },
  data: {
    pageTitle: 'Home Page',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

/**
 * Renders the content selection form shown when "Select Content" is clicked in Moodle's external tool setup.
 */
const LtiUnitLinkState: NgHybridStateDeclaration = {
  name: 'lti/link',
  url: '/lti/link?ltik',
  resolve: {
    ltik: [
      '$stateParams',
      function ($stateParams) {
        return $stateParams.ltik;
      },
    ],
  },
  views: {
    main: {
      component: LtiUnitLinkComponent,
    },
  },
  data: {
    pageTitle: 'Select Content',
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
};

const TimeoutState: NgHybridStateDeclaration = {
  name: 'timeout',
  url: '/timeout?dest&params',
  views: {
    main: {
      component: TimeoutComponent,
    },
  },
  data: {
    pageTitle: '_Timeout_',
  },
};

/**
 * Export the list of states we have created in angular
 */
export const doubtfireStates = [
  institutionSettingsState,
  TeachingPeriodsState,
  HomeState,
  WelcomeState,
  SignInState,
  EditProfileState,
  EulaState,
  usersState,
  ViewAllProjectsState,
  ViewAllUnits,
  AdministerUnits,
  ScormPlayerNormalState,
  ScormPlayerReviewState,
  ScormPlayerStudentReviewState,
  TimeoutState,
  SuccessCloseState,
  projectPlanState,
  TutorDiscussionState,
  jplagReportViewerState,
  LtiDashboardState,
  LtiUnitLinkState,
  TutorAttendance,
];
