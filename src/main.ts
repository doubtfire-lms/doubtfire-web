import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {
  ErrorHandler,
  Injector,
  enableProdMode,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DateFnsAdapter} from '@angular/material-date-fns-adapter';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MatOptionModule,
} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipDefaultOptions,
  MatTooltipModule,
} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';
import {DomSanitizer, Title, bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {provideServiceWorker} from '@angular/service-worker';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {PickerModule} from '@ctrl/ngx-emoji-mart';
import {EmojiModule} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {CodeEditorModule} from '@ngstack/code-editor';
import * as Sentry from '@sentry/angular';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {
  GANTT_GLOBAL_CONFIG,
  GANTT_I18N_LOCALE_TOKEN,
  GanttI18nLocaleConfig,
  GanttLinkLineType,
  NgxGanttModule,
  enUsLocale,
} from '@worktile/gantt';
import {CalendarModule, DateAdapter as CalendarDateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {enAU} from 'date-fns/locale';
import player from 'lottie-web';
import {FlexLayoutModule} from 'ng-flex-layout';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {provideLottieOptions} from 'ngx-lottie';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2-alternative';
import {NgxSkeletonLoaderModule} from 'ngx-skeleton-loader';
import {interval} from 'rxjs';
import {take} from 'rxjs/operators';
import {CreateNewUnitModal} from './app/admin/modals/create-new-unit-modal/create-new-unit-modal.component';
import {TeachingPeriodUnitImportService} from './app/admin/states/teaching-periods/teaching-period-unit-import/teaching-period-unit-import.dialog';
import {
  ActivityTypeService,
  AuthenticationService,
  CampusService,
  D2lAssessmentMappingService,
  EngagementCommentService,
  EngagementService,
  GroupSetService,
  LearningOutcomeService,
  OverseerAssessmentService,
  OverseerImageService,
  ProjectService,
  SubmissionHistoryService,
  TaskCommentService,
  TaskService,
  TaskSimilarityService,
  TeachingPeriodBreakService,
  TeachingPeriodService,
  TutorialService,
  TutorialStreamService,
  UnitRoleService,
  UnitService,
  UserService,
  WebcalService,
} from './app/api/models/doubtfire-model';
import {CommunicationActionService} from './app/api/services/communication-action.service';
import {CommunicationConditionService} from './app/api/services/communication-condition.service';
import {CommunicationRuleService} from './app/api/services/communication-rule.service';
import {CommunicationSetService} from './app/api/services/communication-set.service';
import {DiscussionPromptService} from './app/api/services/discussion-prompt.service';
import {FeedbackTemplateService} from './app/api/services/feedback-template.service';
import {GroupService} from './app/api/services/group.service';
import {LtiService} from './app/api/services/lti.service';
import {MarkingSessionService} from './app/api/services/marking-session.service';
import {OverseerStepResultService} from './app/api/services/overseer-step-result.service';
import {OverseerStepService} from './app/api/services/overseer-step.service';
import {ScormAdapterService} from './app/api/services/scorm-adapter.service';
import {SidekiqJobService} from './app/api/services/sidekiq-job.service';
import {StaffNoteService} from './app/api/services/staff-note.service';
import {TaskDefinitionService} from './app/api/services/task-definition.service';
import {TaskOutcomeAlignmentService} from './app/api/services/task-outcome-alignment.service';
import {TaskPrerequisiteService} from './app/api/services/task-prerequisite.service';
import {TestAttemptService} from './app/api/services/test-attempt.service';
import {TiiActionService} from './app/api/services/tii-action.service';
import {TutorNoteService} from './app/api/services/tutor-note.service';
import {setAppInjector} from './app/app-injector';
import {AppComponent} from './app/app.component';
import {routes} from './app/app.routes';
import {DoubtfireConstants} from './app/config/constants/doubtfire-constants';
import {PrivacyPolicy} from './app/config/privacy-policy/privacy-policy';
import {TasksForInboxSearchPipe} from './app/common/filters/tasks-for-inbox-search.pipe';
import {TasksInTutorialsPipe} from './app/common/filters/tasks-in-tutorials.pipe';
import {TasksOfTaskDefinitionPipe} from './app/common/filters/tasks-of-task-definition.pipe';
import {FileDownloaderService} from './app/common/file-downloader/file-downloader.service';
import {NestedCsvDownloadModalService} from './app/common/learning-outcome-editor/nested-csv-download-modal/nested-csv-download-modal.service';
import {AboutDoubtfireModal} from './app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component';
import {AboutDoubtfireModalService} from './app/common/modals/about-doubtfire-modal/about-doubtfire-modal.service';
import {CsvResultModalService} from './app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from './app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {SpecConModalService} from './app/common/modals/spec-con-modal/spec-con-modal.service';
import {IsActiveUnitRole} from './app/common/pipes/is-active-unit-role.pipe';
import {MarkedPipe} from './app/common/pipes/marked.pipe';
import {AlertService} from './app/common/services/alert.service';
import {EmojiService} from './app/common/services/emoji.service';
import {GradeService} from './app/common/services/grade.service';
import {HttpAuthenticationInterceptor} from './app/common/services/http-authentication.interceptor';
import {HttpErrorInterceptor} from './app/common/services/http-error.interceptor';
import {TaskPlannerPrerequisitesModalService} from './app/projects/states/plan/task-planner/task-planner-prerequisites-modal/task-planner-prerequisites-modal.service';
import {CheckForUpdateService} from './app/sessions/service-worker-updater/check-for-update.service';
import {D2lUnitDetailsModal} from './app/units/states/edit/directives/unit-details-editor/d2l-details-form/d2l-unit-details-form.component';
import {D2lTransferModal} from './app/units/states/portfolios/d2l-transfer-modal/d2l-transfer.component';
import {environment} from './environments/environment';

const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'do MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

const DOUBTFIRE_GANTT_LOCALE = 'doubtfire-en-au';

const DOUBTFIRE_GANTT_LOCALE_CONFIG: GanttI18nLocaleConfig = {
  ...enUsLocale,
  id: DOUBTFIRE_GANTT_LOCALE,
  views: {
    ...enUsLocale.views,
    day: {
      ...enUsLocale.views.day,
      tickFormats: {
        ...enUsLocale.views.day.tickFormats,
        unit: 'd EEE',
      },
    },
  },
};

const GANTT_CHART_LOCALE_CONFIG = {
  provide: GANTT_I18N_LOCALE_TOKEN,
  useValue: DOUBTFIRE_GANTT_LOCALE_CONFIG,
  multi: true,
};

const GANTT_CHART_CONFIG = {
  provide: GANTT_GLOBAL_CONFIG,
  useValue: {
    locale: DOUBTFIRE_GANTT_LOCALE,
    dateOptions: {
      weekStartsOn: 1,
    },
    linkOptions: {
      showArrow: true,
      lineType: GanttLinkLineType.curve,
    },
    styleOptions: {
      headerHeight: 52,
    },
  },
};

const DEFAULT_TOOLTIP_OPTIONS: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 1500,
  position: 'above',
};

function initializeDoubtfireApp(): void {
  inject(Sentry.TraceService);
  inject(CheckForUpdateService);

  const injector = inject(Injector);
  const constants = inject(DoubtfireConstants);
  const title = inject(Title);
  const matIconRegistry = inject(MatIconRegistry);
  const domSanitizer = inject(DomSanitizer);

  setAppInjector(injector);

  constants.ExternalName.subscribe((result) => {
    title.setTitle(result);
  });

  matIconRegistry.addSvgIcon(
    'formatif-logo',
    domSanitizer.bypassSecurityTrustResourceUrl('assets/images/logo.svg'),
  );
}

if (environment.sentryDsn) {
  Sentry.init({
    dsn: environment.sentryDsn,
    tunnel: '/api/client-reports',
    release: environment.sentryRelease || undefined,
    dist: environment.sentryDist || undefined,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    enableLogs: true,
    sendDefaultPii: false,
  });
}

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      FlexLayoutModule,
      FormsModule,
      ClipboardModule,
      DragDropModule,
      ScrollingModule,
      MatToolbarModule,
      MatSidenavModule,
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
      MatNativeDateModule,
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
      MatDatepickerModule,
      MatExpansionModule,
      MatGridListModule,
      MatTabsModule,
      MatTreeModule,
      MatTableModule,
      MatChipsModule,
      MatSnackBarModule,
      ReactiveFormsModule,
      PickerModule,
      EmojiModule,
      NgxChartsModule,
      PdfViewerModule,
      CalendarModule.forRoot({provide: CalendarDateAdapter, useFactory: adapterFactory}),
      CodeEditorModule.forRoot(),
      NgxGanttModule,
      MonacoEditorModule.forRoot(),
      NgxSkeletonLoaderModule,
    ),
    provideZoneChangeDetection(),
    provideAnimationsAsync('noop'),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: () => interval(6000).pipe(take(1)),
    }),
    provideAppInitializer(initializeDoubtfireApp),
    AlertService,
    MarkedPipe,
    CampusService,
    AuthenticationService,
    GroupSetService,
    GroupService,
    UnitService,
    D2lAssessmentMappingService,
    ProjectService,
    UnitRoleService,
    LearningOutcomeService,
    TaskDefinitionService,
    TeachingPeriodService,
    TiiActionService,
    TeachingPeriodBreakService,
    TeachingPeriodUnitImportService,
    TutorialService,
    TutorialStreamService,
    UserService,
    TaskService,
    GradeService,
    TaskSimilarityService,
    WebcalService,
    ActivityTypeService,
    OverseerImageService,
    OverseerAssessmentService,
    SubmissionHistoryService,
    EmojiService,
    FileDownloaderService,
    CheckForUpdateService,
    TaskOutcomeAlignmentService,
    {provide: MAT_DATE_LOCALE, useValue: enAU},
    {provide: DateAdapter, useClass: DateFnsAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT},
    TaskCommentService,
    EngagementCommentService,
    EngagementService,
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
      deps: [AuthenticationService, UserService],
    },
    AboutDoubtfireModal,
    AboutDoubtfireModalService,
    SpecConModalService,
    DoubtfireConstants,
    TasksOfTaskDefinitionPipe,
    TasksInTutorialsPipe,
    TasksForInboxSearchPipe,
    IsActiveUnitRole,
    D2lUnitDetailsModal,
    D2lTransferModal,
    CreateNewUnitModal,
    ScormAdapterService,
    TestAttemptService,
    PrivacyPolicy,
    provideLottieOptions({
      player: () => player,
    }),
    FeedbackTemplateService,
    NestedCsvDownloadModalService,
    StaffNoteService,
    SidekiqJobService,
    LtiService,
    TaskPrerequisiteService,
    MarkingSessionService,
    DiscussionPromptService,
    GANTT_CHART_LOCALE_CONFIG,
    GANTT_CHART_CONFIG,
    TaskPlannerPrerequisitesModalService,
    OverseerStepService,
    OverseerStepResultService,
    TutorNoteService,
    CommunicationActionService,
    CommunicationConditionService,
    CommunicationRuleService,
    CommunicationSetService,
    CsvResultModalService,
    CsvUploadModalService,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    Sentry.TraceService,
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: DEFAULT_TOOLTIP_OPTIONS,
    },
  ],
});
