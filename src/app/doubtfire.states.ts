import { NgHybridStateDeclaration } from '@uirouter/angular-hybrid';
import { InstitutionSettingsComponent } from './admin/institution-settings/institution-settings.component';
import { HomeComponent } from './home/states/home/home.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignInComponent } from './sessions/states/sign-in/sign-in.component';
import { EditProfileComponent } from './account/edit-profile/edit-profile.component';
import { TeachingPeriodListComponent } from './admin/states/teaching-periods/teaching-period-list/teaching-period-list.component';
import { EditTeachingPeriodComponent } from './admin/states/teaching-periods/teaching-period-edit/edit-teaching-period.component';

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


/**
 * Define the teaching period list state - used to list teraching period list data.
 */

const teachingPeriodListState: NgHybridStateDeclaration = {
  name: 'teachingPeriodList', // This is the name of the state to jump to - so ui-sref="institutionsettings" to jump here
  url: '/admin/teaching-periods', // You get here with this url
  views: {
    main: {
      // Main body links to angular component
      component: TeachingPeriodListComponent,
    },
  },
  data: {
    // Add data used by header
    pageTitle: 'Teaching Period List',
    roleWhiteList: ['Admin'],
  },
};

/**
 * Define the teaching period deatial state - used to edit teraching period  data.
 */
const teachingPeriodDetailState: NgHybridStateDeclaration = {
  name: 'teachingPeriodDetail', // This is the name of the state to jump to - so ui-sref="institutionsettings" to jump here
  url: '/admin/teaching-periods/:id', // You get here with this url
  views: {
   
    main: {
      // Main body links to angular component
      component: EditTeachingPeriodComponent,
    },
  },
  data: {
    // Add data used by header
    pageTitle: 'Teaching Period Detail',
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
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin'],
  },
};

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
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin'],
  },
};

/**
 * Define the Sign In state.
 */
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
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin'],
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
    roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin'],
  },
};

/**
 * Export the list of states we have created in angular
 */
export const doubtfireStates = [institutionSettingsState, HomeState, WelcomeState, SignInState, EditProfileState, teachingPeriodListState ,teachingPeriodDetailState];
