import { NgModule, Injector } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { setAppInjector } from './app-injector';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from '@angular/cdk/clipboard';
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
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';

import { PopoverModule } from 'ngx-bootstrap/popover';
import { setTheme } from 'ngx-bootstrap/utils';

import { AboutDoubtfireModalService } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service';
import {
  AboutDoubtfireModal,
  AboutDoubtfireModalContent,
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
  projectServiceProvider,
  alertServiceProvider,
  CsvUploadModalProvider,
  UnitStudentEnrolmentModalProvider,
  CsvResultModalProvider,
  AudioRecorderProvider,
  AudioRecorderServiceProvider,
  userProvider,
  currentUser,
  TaskCommentProvider,
  gradeServiceProvider,
  commentsModalProvider,
  taskDefinitionProvider,
  groupServiceProvider,
  plagiarismReportModalProvider,
} from './ajs-upgraded-providers';
import {
  TaskCommentComposerComponent,
  DiscussionComposerDialog,
} from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContenteditableModule } from '@ng-stack/contenteditable';
import { AudioCommentRecorderComponent } from './common/audio-recorder/audio/audio-comment-recorder/audio-comment-recorder';
import { DiscussionPromptComposerComponent } from './tasks/task-comment-composer/discussion-prompt-composer/discussion-prompt-composer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  IntelligentDiscussionPlayerComponent,
  IntelligentDiscussionDialog,
} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import { MicrophoneTesterComponent } from './common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import { IntelligentDiscussionRecorderComponent } from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-recorder/intelligent-discussion-recorder.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ExtensionCommentComponent } from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import { CampusListComponent } from './admin/states/campuses/campus-list/campus-list.component';
import { ExtensionModalComponent } from './common/modals/extension-modal/extension-modal.component';
import { CalendarModalComponent } from './common/modals/calendar-modal/calendar-modal.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { doubtfireStates } from './doubtfire.states';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { ActivityTypeListComponent } from './admin/states/activities/activity-type-list/activity-type-list.component';
import { UnitStudentsEditorComponent } from './units/states/edit/directives/unit-students-editor/unit-students-editor.component';
import { ActivityTypeService } from './api/models/activity-type/activity-type.service';
import { InstitutionSettingsComponent } from './units/states/institution-settings/institution-settings.component';
import { UnitTutorialsListComponent } from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import { UnitTutorialsManagerComponent } from './units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component';
import { TutorialService } from './api/models/tutorial/tutorial.service';
import { TutorialStreamService } from './api/models/tutorial-stream/tutorial-stream.service';
import { CampusService } from './api/models/campus/campus.service';
import { CommentBubbleActionComponent } from './tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component';
import { UserService } from './api/models/user/user.service';
import { WebcalService } from './api/models/webcal/webcal.service';
import { StudentTutorialSelectComponent } from './units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';
import { StudentCampusSelectComponent } from './units/states/edit/directives/unit-students-editor/student-campus-select/student-campus-select.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiService } from './common/services/emoji.service';
import { TaskListItemComponent } from './projects/states/dashboard/directives/student-task-list/task-list-item/task-list-item.component';
import { CreatePortfolioTaskListItemComponent } from './projects/states/dashboard/directives/student-task-list/create-portfolio-task-list-item/create-portfolio-task-list-item.component';
import { TaskCommentsViewerComponent } from './tasks/task-comments-viewer/task-comments-viewer.component';
import { MarkedPipe } from './common/pipes/marked.pipe';
import { UserIconComponent } from './common/user-icon/user-icon.component';
import { AudioPlayerComponent } from './common/audio-player/audio-player.component';
import { HumanizedDatePipe } from './common/pipes/humanized-date.pipe';
import { DragDropDirective } from './common/directives/drag-drop.directive';
import { PdfViewerComponent } from './common/pdf-viewer/pdf-viewer.component';
import { SafePipe } from './common/pipes/safe.pipe';
import { PdfViewerPanelComponent } from './common/pdf-viewer-panel/pdf-viewer-panel.component';
import { StaffTaskListComponent } from './units/states/tasks/inbox/directives/staff-task-list/staff-task-list.component';
import { FiltersPipe } from './common/filters/filters.pipe';
import { TasksOfTaskDefinitionPipe } from './common/filters/tasks-of-task-definition.pipe';
import { TasksInTutorialsPipe } from './common/filters/tasks-in-tutorials.pipe';
import { TasksWithStudentNamePipe } from './common/filters/tasks-with-student-name.pipe';
import { StatusIconComponent } from './common/status-icon/status-icon.component';
import { TaskPlagiarismCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-plagiarism-card/task-plagiarism-card.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  // Components we declare
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
    CalendarModalComponent,
    InstitutionSettingsComponent,
    CommentBubbleActionComponent,
    UnitTutorialsListComponent,
    UnitTutorialsManagerComponent,
    UnitStudentsEditorComponent,
    StudentTutorialSelectComponent,
    StudentCampusSelectComponent,
    TaskListItemComponent,
    CreatePortfolioTaskListItemComponent,
    StatusIconComponent,
    TaskCommentsViewerComponent,
    UserIconComponent,
    AudioPlayerComponent,
    MarkedPipe,
    HumanizedDatePipe,
    DragDropDirective,
    PdfViewerComponent,
    SafePipe,
    PdfViewerPanelComponent,
    StaffTaskListComponent,
    FiltersPipe,
    TasksOfTaskDefinitionPipe,
    TasksInTutorialsPipe,
    TasksWithStudentNamePipe,
    StatusIconComponent,
    TaskPlagiarismCardComponent,
  ],
  // Module Imports
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ContenteditableModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    ClipboardModule,
    ScrollingModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatBadgeModule,
    MatRadioModule,
    MatListModule,
    MatOptionModule,
    MatStepperModule,
    MatPaginatorModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatSlideToggleModule,
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
    MatExpansionModule,
    UpgradeModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    ReactiveFormsModule,
    PickerModule,
    EmojiModule,
    PopoverModule.forRoot(),
    UIRouterUpgradeModule.forRoot({ states: doubtfireStates }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately',
    }),
  ],
  // Services we provide
  providers: [
    CampusService,
    TutorialService,
    TutorialStreamService,
    UserService,
    WebcalService,
    ActivityTypeService,
    EmojiService,
    userProvider,
    groupServiceProvider,
    unitProvider,
    commentsModalProvider,
    taskDefinitionProvider,
    authProvider,
    currentUserProvider,
    taskServiceProvider,
    gradeServiceProvider,
    analyticsServiceProvider,
    taskProvider,
    projectServiceProvider,
    alertServiceProvider,
    CsvUploadModalProvider,
    CsvResultModalProvider,
    UnitStudentEnrolmentModalProvider,
    TaskCommentServiceProvider,
    TaskCommentProvider,
    AudioRecorderProvider,
    AudioRecorderServiceProvider,
    plagiarismReportModalProvider,
    UnitStudentsEditorComponent,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
      deps: [currentUser],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    AboutDoubtfireModal,
    AboutDoubtfireModalService,
    DoubtfireConstants,
    TasksOfTaskDefinitionPipe,
    TasksInTutorialsPipe,
    TasksWithStudentNamePipe,
  ],
})
// There is no longer any requirement for an EntryComponents section
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

    this.constants.ExternalName.subscribe((result) => {
      this.title.setTitle(result);
    });
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [DoubtfireAngularJSModule.name], {
      strictDi: false,
    });
  }
}
