import { NgModule, Injector } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';

import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';

import { PopoverModule } from 'ngx-bootstrap';
import { setTheme } from 'ngx-bootstrap/utils';

import { AboutDoubtfireModalService } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service';
import {
  AboutDoubtfireModal,
  AboutDoubtfireModalContent
} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import {
  UserNotificationSettingsModal,
  UserNotificationSettingsModalContent
} from 'src/app/admin/modals/user-notification-settings-modal/user-notification-settings-modal.component';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

import { DoubtfireAngularJSModule } from 'src/app/doubtfire-angularjs.module';
import { HttpErrorInterceptor } from './common/services/http-error.interceptor';
import { TokenInterceptor } from './common/services/http-authentication.interceptor';
import {
  unitProvider,
  currentUserProvider,
  authProvider,
  taskServiceProvider,
  analyticsServiceProvider,
  taskProvider,
  alertServiceProvider,
  CommentResourceServiceProvider,
  AudioRecorderProvider,
  AudioRecorderServiceProvider,
  userProvider,
  currentUser,
  ifRoleProvider
} from './ajs-upgraded-providers';
import {
  TaskCommentComposerComponent,
  DiscussionComposerDialog
} from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContenteditableModule } from '@ng-stack/contenteditable';
import { AudioCommentRecorderComponent } from './common/audio-recorder/audio/audio-comment-recorder/audio-comment-recorder';
import {
  DiscussionPromptComposerComponent
} from './tasks/task-comment-composer/discussion-prompt-composer/discussion-prompt-composer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  IntelligentDiscussionPlayerComponent,
  IntelligentDiscussionDialog
} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import { MicrophoneTesterComponent } from './common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import { IntelligentDiscussionRecorderComponent } from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-recorder/intelligent-discussion-recorder.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ExtensionCommentComponent } from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import { CampusListComponent } from './admin/states/campuses/campus-list/campus-list.component';
import { ExtensionModalComponent } from './common/modals/extension-modal/extension-modal.component';

import 'hammerjs';
import { UserIconComponent } from './common/user-icon/user-icon.component';
import { UserSettingsDialogContent, UserSettingsDialog } from './admin/modals/user-settings-modal/user-settings-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UserService } from './api/models/user/user.service';
import { UnitTutorialEditDialogContent, UnitTutorialEditDialog } from './units/modals/unit-tutorial-edit-dialog/unit-tutorial-edit-dialog.component';
import { MatOptionModule } from '@angular/material/core';
import { TutorialService } from './api/models/tutorial/tutorial.service';
import { doubtfireStates } from './doubtfire.states';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { UnitTutorialsListComponent } from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import { ActivityListComponent } from './admin/states/activities/activity-list/activity-list.component';
import { InstitutionSettingsComponent } from './units/states/institution-settings/institution-settings.component';

@NgModule({
  // components
  declarations: [
    AboutDoubtfireModalContent,
    UserSettingsDialogContent,
    UserNotificationSettingsModalContent,
    UnitTutorialEditDialogContent,
    TaskCommentComposerComponent,
    AudioCommentRecorderComponent,
    MicrophoneTesterComponent,
    DiscussionPromptComposerComponent,
    IntelligentDiscussionPlayerComponent,
    UnitTutorialsListComponent,
    IntelligentDiscussionDialog,
    DiscussionComposerDialog,
    IntelligentDiscussionRecorderComponent,
    ExtensionCommentComponent,
    CampusListComponent,
    ActivityListComponent,
    ExtensionModalComponent,
    UserIconComponent,
    InstitutionSettingsComponent
  ],
  // Module Imports
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ContenteditableModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatRadioModule,
    MatListModule,
    MatOptionModule,
    MatStepperModule,
    MatSelectModule,
    MatButtonToggleModule,
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
    UpgradeModule,
    MatTableModule,
    MatTabsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    UIRouterUpgradeModule.forRoot({ states: doubtfireStates })
  ],
  // Services
  providers: [
    UserService,
    TutorialService,
    userProvider,
    unitProvider,
    ifRoleProvider,
    authProvider,
    currentUserProvider,
    taskServiceProvider,
    currentUserProvider,
    analyticsServiceProvider,
    taskProvider,
    alertServiceProvider,
    CommentResourceServiceProvider,
    AudioRecorderProvider,
    AudioRecorderServiceProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
      deps: [currentUser]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    AboutDoubtfireModal,
    AboutDoubtfireModalService,
    UserSettingsDialog,
    UnitTutorialEditDialog,
    UserNotificationSettingsModal,
    DoubtfireConstants
  ],
  entryComponents: [
    AboutDoubtfireModalContent,
    UserNotificationSettingsModalContent,
    TaskCommentComposerComponent,
    IntelligentDiscussionPlayerComponent,
    UnitTutorialsListComponent,
    ExtensionCommentComponent,
    IntelligentDiscussionDialog,
    DiscussionComposerDialog,
    ExtensionModalComponent,
    UserIconComponent,
    UserSettingsDialogContent,
    UnitTutorialEditDialogContent
  ]
})
export class DoubtfireAngularModule {
  constructor(
    private upgrade: UpgradeModule,
    private constants: DoubtfireConstants,
    private title: Title
  ) {
    setTheme('bs3'); // or 'bs4'

    this.constants.ExternalName.subscribe(result => {
      this.title.setTitle(result);
    });
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [DoubtfireAngularJSModule.name], {
      strictDi: false
    });
  }
}
