import { InjectionToken } from '@angular/core';

// Define an injection token for injecting globally into components.
// Use the name of the angularjs service as the injection token string
export const uploadSubmissionModal = new InjectionToken('uploadSubmissionModal');
export const gradeTaskModal = new InjectionToken('gradeTaskModal');
export const gradeService = new InjectionToken('gradeService');
export const analyticsService = new InjectionToken('analyticsService');
export const dateService = new InjectionToken('dateService');
export const alertService = new InjectionToken('AlertService');
export const audioRecorder = new InjectionToken('audioRecorder');
export const audioRecorderService = new InjectionToken('recorderService');
export const csvUploadModalService = new InjectionToken('CsvUploadModalAngular');
export const csvResultModalService = new InjectionToken('CsvResultModalAngular');
export const confirmationModal = new InjectionToken('ConfirmationModal');
export const unitStudentEnrolmentModal = new InjectionToken('UnitStudentEnrolmentModalAngular');
export const commentsModal = new InjectionToken('CommentsModal');
export const visualisations = new InjectionToken('Visualisation');
export const rootScope = new InjectionToken('$rootScope');
export const calendarModal = new InjectionToken('CalendarModal');
export const aboutDoubtfireModal = new InjectionToken('AboutDoubtfireModal');
export const plagiarismReportModal = new InjectionToken('PlagiarismReportModal');
export const createUnitModal = new InjectionToken('CreateUnitModal');

// Define a provider for the above injection token...
// It will get the service from AngularJS via the factory
export const visualisationsProvider = {
  provide: visualisations,
  useFactory: (i: any) => i.get('Visualisation'),
  deps: ['$injector'],
};


export const calendarModalProvider = {
  provide: calendarModal,
  useFactory: (i: any) => i.get('CalendarModal'),
  deps: ['$injector'],
};

export const rootScopeProvider = {
  provide: rootScope,
  useFactory: (i: any) => i.get('$rootScope'),
  deps: ['$injector'],
};

export const aboutDoubtfireModalProvider = {
  provide: aboutDoubtfireModal,
  useFactory: (i: any) => i.get('AboutDoubtfireModal'),
  deps: ['$injector'],
};

export const plagiarismReportModalProvider = {
  provide: plagiarismReportModal,
  useFactory: (i: any) => i.get('PlagiarismReportModal'),
  deps: ['$injector'],
};

export const commentsModalProvider = {
  provide: commentsModal,
  useFactory: (i: any) => i.get('CommentsModal'),
  deps: ['$injector'],
};

export const uploadSubmissionModalProvider = {
  provide: uploadSubmissionModal,
  useFactory: (i: any) => i.get('UploadSubmissionModal'),
  deps: ['$injector'],
};

export const gradeTaskModalProvider = {
  provide: gradeTaskModal,
  useFactory: (i: any) => i.get('GradeTaskModal'),
  deps: ['$injector'],
};

export const gradeServiceProvider = {
  provide: gradeService,
  useFactory: (i: any) => i.get('gradeService'),
  deps: ['$injector'],
};

export const analyticsServiceProvider = {
  provide: analyticsService,
  useFactory: (i: any) => i.get('analyticsService'),
  deps: ['$injector'],
};

export const dateServiceProvider = {
  provide: dateService,
  useFactory: (i: any) => i.get('dateService'),
  deps: ['$injector'],
};

export const alertServiceProvider = {
  provide: alertService,
  useFactory: (i: any) => i.get('alertService'),
  deps: ['$injector'],
};

export const AudioRecorderProvider = {
  provide: audioRecorder,
  useFactory: (i: any) => i.get('audioRecorder'),
  deps: ['$injector'],
};

export const AudioRecorderServiceProvider = {
  provide: audioRecorderService,
  useFactory: (i: any) => i.get('recorderService'),
  deps: ['$injector'],
};

export const CsvUploadModalProvider = {
  provide: csvUploadModalService,
  useFactory: (i: any) => i.get('CsvUploadModal'),
  deps: ['$injector'],
};

export const CsvResultModalProvider = {
  provide: csvResultModalService,
  useFactory: (i: any) => i.get('CsvResultModal'),
  deps: ['$injector'],
};

export const ConfirmationModalProvider = {
  provide: confirmationModal,
  useFactory: (i: any) => i.get('ConfirmationModal'),
  deps: ['$injector'],
};

export const UnitStudentEnrolmentModalProvider = {
  provide: unitStudentEnrolmentModal,
  useFactory: (i: any) => i.get('UnitStudentEnrolmentModal'),
  deps: ['$injector'],
};

export const CreateUnitModalProvider = {
  provide: createUnitModal,
  useFactory: (i: any) => i.get('CreateUnitModal'),
  deps: ['$injector'],
};
