import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

import { NgModule, Injector, DoBootstrap } from '@angular/core';
import { BrowserModule, DomSanitizer, Title } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { AppInjector, setAppInjector } from './app-injector';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';

import { setTheme } from 'ngx-bootstrap/utils';

import { AboutDoubtfireModalService } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service';
import {
  AboutDoubtfireModal,
  AboutDoubtfireModalContent,
} from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

import { DoubtfireAngularJSModule } from 'src/app/doubtfire-angularjs.module';
import { HttpAuthenticationInterceptor } from './common/services/http-authentication.interceptor';
import {
  visualisationsProvider,
  analyticsServiceProvider,
  dateServiceProvider,
  alertServiceProvider,
  CsvUploadModalProvider,
  UnitStudentEnrolmentModalProvider,
  CsvResultModalProvider,
  AudioRecorderProvider,
  AudioRecorderServiceProvider,
  gradeServiceProvider,
  commentsModalProvider,
  plagiarismReportModalProvider,
  rootScopeProvider,
  aboutDoubtfireModalProvider,
  calendarModalProvider,
  uploadSubmissionModal,
  gradeTaskModalProvider,
  uploadSubmissionModalProvider,
  ConfirmationModalProvider,
} from './ajs-upgraded-providers';
import {
  TaskCommentComposerComponent,
  DiscussionComposerDialog,
} from 'src/app/tasks/task-comment-composer/task-comment-composer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AudioCommentRecorderComponent } from './common/audio-recorder/audio/audio-comment-recorder/audio-comment-recorder';
import { DiscussionPromptComposerComponent } from './tasks/task-comment-composer/discussion-prompt-composer/discussion-prompt-composer.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import {
  IntelligentDiscussionPlayerComponent,
  IntelligentDiscussionDialog,
} from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component';
import { MicrophoneTesterComponent } from './common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import { IntelligentDiscussionRecorderComponent } from './tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-recorder/intelligent-discussion-recorder.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ExtensionCommentComponent } from './tasks/task-comments-viewer/extension-comment/extension-comment.component';
import { CampusListComponent } from './admin/institution-settings/campuses/campus-list/campus-list.component';
import { ExtensionModalComponent } from './common/modals/extension-modal/extension-modal.component';
import { CalendarModalComponent } from './common/modals/calendar-modal/calendar-modal.component';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { doubtfireStates } from './doubtfire.states';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatSortModule } from '@angular/material/sort';
import { ActivityTypeListComponent } from './admin/institution-settings/activity-type-list/activity-type-list.component';
import { UnitStudentsEditorComponent } from './units/states/edit/directives/unit-students-editor/unit-students-editor.component';
import { InstitutionSettingsComponent } from './admin/institution-settings/institution-settings.component';
import { UnitTutorialsListComponent } from './units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';
import { UnitTutorialsManagerComponent } from './units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component';
import { CommentBubbleActionComponent } from './tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component';
import { StudentTutorialSelectComponent } from './units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component';
import { StudentCampusSelectComponent } from './units/states/edit/directives/unit-students-editor/student-campus-select/student-campus-select.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiService } from './common/services/emoji.service';
import { TaskListItemComponent } from './projects/states/dashboard/directives/student-task-list/task-list-item/task-list-item.component';
import { CreatePortfolioTaskListItemComponent } from './projects/states/dashboard/directives/student-task-list/create-portfolio-task-list-item/create-portfolio-task-list-item.component';
import { TaskDescriptionCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.component';
import { TaskCommentsViewerComponent } from './tasks/task-comments-viewer/task-comments-viewer.component';
import { MarkedPipe } from './common/pipes/marked.pipe';
import { UserIconComponent } from './common/user-icon/user-icon.component';
import { AudioPlayerComponent } from './common/audio-player/audio-player.component';
import { HumanizedDatePipe } from './common/pipes/humanized-date.pipe';
import { DragDropDirective } from './common/directives/drag-drop.directive';
import { fPdfViewerComponent } from './common/pdf-viewer/pdf-viewer.component';
import { SafePipe } from './common/pipes/safe.pipe';
import { PdfViewerPanelComponent } from './common/pdf-viewer-panel/pdf-viewer-panel.component';
import { StaffTaskListComponent } from './units/states/tasks/inbox/directives/staff-task-list/staff-task-list.component';
import { FiltersPipe } from './common/filters/filters.pipe';
import { TasksOfTaskDefinitionPipe } from './common/filters/tasks-of-task-definition.pipe';
import { TasksInTutorialsPipe } from './common/filters/tasks-in-tutorials.pipe';
import { TasksForInboxSearchPipe } from './common/filters/tasks-for-inbox-search.pipe';
import { StatusIconComponent } from './common/status-icon/status-icon.component';
import { TaskPlagiarismCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-plagiarism-card/task-plagiarism-card.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CheckForUpdateService } from './sessions/service-worker-updater/check-for-update.service';
import {
  ActivityTypeService,
  CampusService,
  AuthenticationService,
  GroupSetService,
  OverseerImageService,
  OverseerAssessmentService,
  TaskCommentService,
  TeachingPeriodService,
  TeachingPeriodBreakService,
  TutorialService,
  TutorialStreamService,
  UnitService,
  TaskService,
  ProjectService,
  UnitRoleService,
  UserService,
  WebcalService,
  LearningOutcomeService,
} from './api/models/doubtfire-model';
import { FileDownloaderService } from './common/file-downloader/file-downloader';
import { PdfImageCommentComponent } from './tasks/task-comments-viewer/pdf-image-comment/pdf-image-comment.component';
import { OverseerImageListComponent } from './admin/institution-settings/overseer-images/overseer-image-list.component';

import { TaskAssessorComponent } from './tasks/task-definition-editor/task-assessor/task-assessor.component';
import { TaskAssessmentCommentComponent } from './tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component';
import { TaskAssessmentModalComponent } from './common/modals/task-assessment-modal/task-assessment-modal.component';

import { TaskSubmissionHistoryComponent } from './tasks/task-submission-history/task-submission-history.component';
import { HomeComponent } from './home/states/home/home.component';
import { IsActiveUnitRole } from './common/pipes/is-active-unit-role.pipe';
import { HeaderComponent } from './common/header/header.component';
import { UnitDropdownComponent } from './common/header/unit-dropdown/unit-dropdown.component';
import { TaskDropdownComponent } from './common/header/task-dropdown/task-dropdown.component';
import { SplashScreenComponent } from './home/splash-screen/splash-screen.component';
import { HttpErrorInterceptor } from './common/services/http-error.interceptor';
import { TaskDefinitionService } from './api/services/task-definition.service';
import { TaskOutcomeAlignmentService } from './api/services/task-outcome-alignment.service';
import { GroupService } from './api/services/group.service';
import { ObjectSelectComponent } from './common/obect-select/object-select.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { HeroSidebarComponent } from './common/hero-sidebar/hero-sidebar.component';
import { SignInComponent } from './sessions/states/sign-in/sign-in.component';
import { EditProfileFormComponent } from './common/edit-profile-form/edit-profile-form.component';
import { TransitionHooksService } from './sessions/transition-hooks.service';
import { EditProfileComponent } from './account/edit-profile/edit-profile.component';
import { UserBadgeComponent } from './common/user-badge/user-badge.component';
import { TaskStatusCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.component';
import { TaskDueCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.component';
import { FooterComponent } from './common/footer/footer.component';
import { TaskAssessmentCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.component';
import { TaskSubmissionCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.component';
import { TaskDashboardComponent } from './projects/states/dashboard/directives/task-dashboard/task-dashboard.component';
import { InboxComponent } from './units/states/tasks/inbox/inbox.component';
import { ProjectProgressBarComponent } from './common/project-progress-bar/project-progress-bar.component';

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
    PdfImageCommentComponent,
    CampusListComponent,
    ActivityTypeListComponent,
    OverseerImageListComponent,
    ExtensionModalComponent,
    CalendarModalComponent,
    InstitutionSettingsComponent,
    HomeComponent,
    CommentBubbleActionComponent,
    UnitTutorialsListComponent,
    UnitTutorialsManagerComponent,
    UnitStudentsEditorComponent,
    StudentTutorialSelectComponent,
    StudentCampusSelectComponent,
    TaskListItemComponent,
    CreatePortfolioTaskListItemComponent,
    TaskDescriptionCardComponent,
    StatusIconComponent,
    TaskCommentsViewerComponent,
    UserIconComponent,
    AudioPlayerComponent,
    MarkedPipe,
    HumanizedDatePipe,
    IsActiveUnitRole,
    DragDropDirective,
    fPdfViewerComponent,
    SafePipe,
    PdfViewerPanelComponent,
    StaffTaskListComponent,
    FiltersPipe,
    TasksOfTaskDefinitionPipe,
    TasksInTutorialsPipe,
    TasksForInboxSearchPipe,
    StatusIconComponent,
    TaskPlagiarismCardComponent,
    TaskAssessorComponent,
    TaskAssessmentCommentComponent,
    TaskAssessmentModalComponent,
    TaskSubmissionHistoryComponent,
    HeaderComponent,
    UnitDropdownComponent,
    TaskDropdownComponent,
    SplashScreenComponent,
    ObjectSelectComponent,
    WelcomeComponent,
    HeroSidebarComponent,
    SignInComponent,
    EditProfileFormComponent,
    EditProfileComponent,
    UserBadgeComponent,
    TaskStatusCardComponent,
    TaskDueCardComponent,
    FooterComponent,
    TaskAssessmentCardComponent,
    TaskSubmissionCardComponent,
    TaskDashboardComponent,
    InboxComponent,
    ProjectProgressBarComponent,
  ],
  // Module Imports
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    ClipboardModule,
    DragDropModule,
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
    MatCardModule,
    MatGridListModule,
    MatSelectModule,
    MatToolbarModule,
    MatTabsModule,
    UpgradeModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    PickerModule,
    EmojiModule,
    PdfViewerModule,
    UIRouterUpgradeModule.forRoot({ states: doubtfireStates }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: () => interval(6000).pipe(take(1)),
    }),
  ],
  // Services we provide
  providers: [
    CampusService,
    AuthenticationService,
    GroupSetService,
    GroupService,
    UnitService,
    ProjectService,
    UnitRoleService,
    LearningOutcomeService,
    TaskDefinitionService,
    TeachingPeriodService,
    TeachingPeriodBreakService,
    TutorialService,
    TutorialStreamService,
    UserService,
    TaskService,
    WebcalService,
    ActivityTypeService,
    OverseerImageService,
    OverseerAssessmentService,
    EmojiService,
    FileDownloaderService,
    CheckForUpdateService,
    TaskOutcomeAlignmentService,
    visualisationsProvider,
    commentsModalProvider,
    rootScopeProvider,
    calendarModalProvider,
    aboutDoubtfireModalProvider,
    gradeServiceProvider,
    uploadSubmissionModalProvider,
    gradeTaskModalProvider,
    analyticsServiceProvider,
    dateServiceProvider,
    alertServiceProvider,
    CsvUploadModalProvider,
    CsvResultModalProvider,
    UnitStudentEnrolmentModalProvider,
    TaskCommentService,
    AudioRecorderProvider,
    AudioRecorderServiceProvider,
    plagiarismReportModalProvider,
    UnitStudentsEditorComponent,
    ConfirmationModalProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthenticationInterceptor,
      multi: true,
      deps: [UserService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
      deps: [AuthenticationService],
    },
    AboutDoubtfireModal,
    AboutDoubtfireModalService,
    DoubtfireConstants,
    TasksOfTaskDefinitionPipe,
    TasksInTutorialsPipe,
    TasksForInboxSearchPipe,
    IsActiveUnitRole,
  ],
})
// There is no longer any requirement for an EntryComponents section
// since Angular 9 introduced the IVY renderer
export class DoubtfireAngularModule implements DoBootstrap {
  constructor(
    injector: Injector,
    private upgrade: UpgradeModule,
    private constants: DoubtfireConstants,
    private title: Title,
    private updater: CheckForUpdateService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    setAppInjector(injector);
    setTheme('bs3'); // or 'bs4'

    this.constants.ExternalName.subscribe((result) => {
      this.title.setTitle(result);
    });

    this.matIconRegistry.addSvgIcon(
      'formatif-logo',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/logo.svg')
    );
  }

  ngDoBootstrap(): void {
    this.upgrade.bootstrap(document.body, [DoubtfireAngularJSModule.name], {
      strictDi: false,
    });
    AppInjector.get(TransitionHooksService);
  }
}
