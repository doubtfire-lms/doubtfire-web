import { NgHybridStateDeclaration } from '@uirouter/angular-hybrid';
import { Ng2ViewDeclaration } from '@uirouter/angular';
import { InstitutionSettingsComponent } from './admin/institution-settings/institution-settings.component';
import { HomeComponent } from './home/states/home/home.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignInComponent } from './sessions/states/sign-in/sign-in.component';

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
    // These are the 2 views - the header and main from the body of DF
    header: {
      // Header is still angularjs
      controller: 'BasicHeaderCtrl', // This is the angularjs controller
      templateUrl: 'common/header/header.tpl.html', // and the related template html
    } as unknown as Ng2ViewDeclaration, // Need dodgy cast to get compiler to ignore type data
    main: {
      // Main body links to angular component
      component: InstitutionSettingsComponent,
    },
  },
  data: {
    // Add data used by header
    pageTitle: 'Institution Settings',
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
    header: {
      controller: 'BasicHeaderCtrl',
      templateUrl: 'common/header/header.tpl.html',
    } as unknown as Ng2ViewDeclaration,
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
    header: {
      controller: 'BasicHeaderCtrl',
      templateUrl: 'common/header/header.tpl.html',
    } as unknown as Ng2ViewDeclaration,
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
  name: 'sign_in_2',
  url: '/sign_in_2?dest&params&authToken&username',
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
 * Export the list of states we have created in angular
 */
export const doubtfireStates = [institutionSettingsState, HomeState, WelcomeState, SignInState];
