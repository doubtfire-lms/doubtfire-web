import { NgModule, Injector } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { setAppInjector } from './app-injector';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';

import { PopoverModule } from 'ngx-bootstrap';
import { setTheme } from 'ngx-bootstrap/utils';

import { AboutDoubtfireModalService } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service';
import {
  AboutDoubtfireModal,
  AboutDoubtfireModalContent
} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

import { DoubtfireAngularJSModule } from 'src/app/doubtfire-angularjs.module';
import { HttpErrorInterceptor } from './common/services/http-error.interceptor';
import { TokenInterceptor } from './common/services/http-authentication.interceptor';
import {
  unitProvider,
  currentUserProvider,
  authProvider,
  taskServiceProvider,
  TaskCommentServiceProvider,
  analyticsServiceProvider,
  taskProvider,
  alertServiceProvider,
  CsvUploadModalProvider,
  CsvResultModalProvider,
  CommentResourceServiceProvider,
  AudioRecorderProvider,
  AudioRecorderServiceProvider,
  userProvider,
  currentUser
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
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { doubtfireStates } from './doubtfire.states';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { ActivityTypeListComponent } from './admin/states/activities/activity-type-list/activity-type-list.component';
import {UnitStudentsEditorComponent} from './units/states/edit/directives/unit-students-editor/unit-students-editor.component';
import { ActivityTypeService } from './api/models/activity-type/activity-type.service';
import { InstitutionSettingsComponent } from './units/states/institution-settings/institution-settings.component';
import { UnitTutorialsListComponent } from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import { UnitTutorialsManagerComponent } from './units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component';
import { TutorialService } from './api/models/tutorial/tutorial.service';
import { TutorialStreamService } from './api/models/tutorial-stream/tutorial-stream.service';
import { CampusService } from './api/models/campus/campus.service';
import { CommentBubbleActionComponent } from './tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component';
import { UserService } from './api/models/user/user.service';
import { StudentTutorialSelectComponent } from './units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';

@NgModule({
  // components
  declarations: [
    AboutDoubtfireModalContent,
    TaskCommentComposerComponent,
    AudioCommentRecorderComponent,
    MicrophoneTesterComponent,
    DiscussionPromptComposerComponent,
    IntelligentDiscussionPlayerComponent,
    IntelligentDiscussionDialog,
    DiscussionComposerDialog,
    IntelligentDiscussionRecorderComponent,
    ExtensionCommentComponent,
    CampusListComponent,
    ActivityTypeListComponent,
    ExtensionModalComponent,
    InstitutionSettingsComponent,
    CommentBubbleActionComponent,
    UnitTutorialsListComponent,
    UnitTutorialsManagerComponent,
    UnitStudentsEditorComponent,
    StudentTutorialSelectComponent
  ],
  // Module Imports
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ContenteditableModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatRadioModule,
    MatListModule,
    MatOptionModule,
    MatStepperModule,
    MatPaginatorModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTooltipModule,
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
    CampusService,
    TutorialService,
    TutorialStreamService,
    UserService,
    ActivityTypeService,
    userProvider,
    unitProvider,
    authProvider,
    currentUserProvider,
    taskServiceProvider,
    analyticsServiceProvider,
    taskProvider,
    alertServiceProvider,
    CsvUploadModalProvider,
    CsvResultModalProvider,
    CommentResourceServiceProvider,
    TaskCommentServiceProvider,
    AudioRecorderProvider,
    AudioRecorderServiceProvider,
    UnitStudentsEditorComponent,
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
    DoubtfireConstants
  ]
})
  // There is no longer any requirement for an EntryComponants section
  // since Angular 9 introduced the IVY renderer

export class DoubtfireAngularModule {
  constructor(
    injector: Injector,
    private upgrade: UpgradeModule,
    private constants: DoubtfireConstants,
    private title: Title
  ) {
    setAppInjector(injector);
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
