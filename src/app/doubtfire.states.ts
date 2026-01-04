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

/*  IMPORT */
import {unitsIndexState} from './units/states/index/index.state';

/*
 * Use this file to store any states that are sourced by angular components.
 */

const institutionSettingsState: NgHybridStateDeclaration = {
  name: 'institutionsettings',
  url: '/admin/institution-settings',
  views: {
    main: {
      component: InstitutionSettingsComponent,
    },
  },
  data: {
    pageTitle: 'Institution Settings',
    roleWhiteList: ['Admin'],
  },
};

const usersState: NgHybridStateDeclaration = {
  name: 'admin/users',
  url: '/admin/users',
  views: {
    main: {
      component: FUsersComponent,
    },
  },
  data: {
    pageTitle: 'Administer users',
    roleWhiteList: ['Admin'],
  },
};

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

const SignInState: NgHybridStateDeclaration = {
  name: 'sign_in',
  url: '/sign_in?dest&params&authToken&username',
  views: {
    main: {
      component: SignInComponent,
    },
  },
  data: {
    pageTitle: 'Sign In',
  },
};

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
    pageTitle: 'Teaching Periods',
    roleWhitelist: ['Convenor', 'Admin'],
  },
};

const ViewAllProjectsState: NgHybridStateDeclaration = {
  name: 'view-all-projects',
  url: '/view-all-projects',
  resolve: {
    mode: () => 'student',
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
  name: 'admin/units',
  url: '/admin/units',
  resolve: {
    mode: () => 'admin',
  },
  views: {
    main: {
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
  resolve: {
    mode: () => 'tutor',
  },
  views: {
    main: {
      component: FUnitsComponent,
    },
  },
  data: {
    pageTitle: 'Teaching Periods',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin'],
  },
};

/* FINAL EXPORTED STATE LIST */
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

  /* STRICT MIGRATION STATE */
  unitsIndexState,
];
