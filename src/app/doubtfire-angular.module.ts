import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';

import { PopoverModule } from 'ngx-bootstrap';
import { setTheme } from 'ngx-bootstrap/utils';

import { AboutDoubtfireModalService } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service';
import { AboutDoubtfireModal, AboutDoubtfireModalContent } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component'
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

import { DoubtfireAngularJSModule } from 'src/app/doubtfire-angularjs.module';
import { HttpErrorInterceptor } from './common/services/http-error.interceptor';
import { unitProvider, taskServiceProvider, analyticsServiceProvider, taskProvider, alertServiceProvider, CommentResourceServiceProvider, AudioRecorderProvider, AudioRecorderServiceProvider } from './ajs-upgraded-providers';
import { TaskCommentComposerComponent, DiscussionComposerDialog } from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContenteditableModule } from '@ng-stack/contenteditable';
import { AudioCommentRecorderComponent } from './common/audio-recorder/audio/audio-comment-recorder/audio-comment-recorder';
import { DiscussionPromptComposerComponent } from './tasks/task-comment-composer/discussion-prompt-composer/discussion-prompt-composer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IntelligentDiscussionPlayerComponent, IntelligentDiscussionDialog } from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import { MicrophoneTesterComponent } from './common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import { IntelligentDiscussionRecorderComponent } from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-recorder/intelligent-discussion-recorder.component';
import { FlexLayoutModule } from "@angular/flex-layout";
import { ExtensionCommentComponent } from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import { ExtensionModalComponent } from './common/modals/extension-modal/extension-modal.component';

import 'hammerjs';
import { TaskAssessorComponent } from './tasks/task-definition-editor/task-assessor/task-assessor.component';
import { TaskAssessmentCommentComponent } from './tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component';
import { TaskAssessmentModalComponent } from './common/modals/task-assessment-modal/task-assessment-modal.component';

import { TaskSubmissionHistoryComponent } from './tasks/task-submission-history/task-submission-history.component';
import { TaskSubmissionTabContentComponent } from './tasks/task-submission-history/task-submission-tab-content.component';


import en from '@angular/common/locales/en';

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
    ExtensionModalComponent,
    TaskAssessorComponent,
    TaskAssessmentCommentComponent,
    TaskAssessmentModalComponent,
    TaskSubmissionHistoryComponent,
    TaskSubmissionTabContentComponent,
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
    MatInputModule,
    MatListModule,
    MatStepperModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatDialogModule,
    MatProgressBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatCardModule,
    MatExpansionModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule,
    MatGridListModule,
    UpgradeModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    UIRouterUpgradeModule.forRoot(),
  ],
  // Services
  providers: [
    unitProvider,
    taskServiceProvider,
    analyticsServiceProvider,
    taskProvider,
    alertServiceProvider,
    CommentResourceServiceProvider,
    AudioRecorderProvider,
    AudioRecorderServiceProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    AboutDoubtfireModal,
    AboutDoubtfireModalService,
    DoubtfireConstants,
  ],
  entryComponents: [
    AboutDoubtfireModalContent,
    TaskCommentComposerComponent,
    IntelligentDiscussionPlayerComponent,
    ExtensionCommentComponent,
    IntelligentDiscussionDialog,
    DiscussionComposerDialog,
    ExtensionModalComponent,
    TaskAssessorComponent,
    TaskAssessmentCommentComponent,
    TaskAssessmentModalComponent,
    TaskSubmissionHistoryComponent,
    TaskSubmissionTabContentComponent,
  ]
})
export class DoubtfireAngularModule {
  constructor(private upgrade: UpgradeModule, private constants: DoubtfireConstants, private title: Title) {
    setTheme('bs3'); // or 'bs4'

    this.constants.ExternalName
      .subscribe(result => {
        this.title.setTitle(result);
      });
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [DoubtfireAngularJSModule.name], { strictDi: false });
  }
}
