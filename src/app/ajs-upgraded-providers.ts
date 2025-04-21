import {InjectionToken} from '@angular/core';

// Define an injection token for injecting globally into components.
// Use the name of the angularjs service as the injection token string
export const uploadSubmissionModal = new InjectionToken('uploadSubmissionModal');
export const gradeTaskModal = new InjectionToken('gradeTaskModal');
export const analyticsService = new InjectionToken('analyticsService');
export const dateService = new InjectionToken('dateService');
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
export const CampusService = new InjectionToken('campusService');
export const Project = new InjectionToken('Project');

export const projectProvider = {
  provide: Project,
  useFactory: (i: any) => i.get('Project'),
  deps: ['$injector'],
};

export const campusServiceProvider = {
  provide: CampusService,
  useFactory: (i: any) => i.get('campusService'),
  deps: ['$injector'],
};

// Define a provider for the above injection token...
// It will get the service from AngularJS via the factory
export const visualisationsProvider = {
  provide: visualisations,
  useFactory: (i) => i.get('Visualisation'),
  deps: ['$injector'],
};

export const calendarModalProvider = {
  provide: calendarModal,
  useFactory: (i) => i.get('CalendarModal'),
  deps: ['$injector'],
};

export const rootScopeProvider = {
  provide: rootScope,
  useFactory: (i) => i.get('$rootScope'),
  deps: ['$injector'],
};

export const aboutDoubtfireModalProvider = {
  provide: aboutDoubtfireModal,
  useFactory: (i) => i.get('AboutDoubtfireModal'),
  deps: ['$injector'],
};

export const plagiarismReportModalProvider = {
  provide: plagiarismReportModal,
  useFactory: (i) => i.get('PlagiarismReportModal'),
  deps: ['$injector'],
};

export const commentsModalProvider = {
  provide: commentsModal,
  useFactory: (i) => i.get('CommentsModal'),
  deps: ['$injector'],
};

export const uploadSubmissionModalProvider = {
  provide: uploadSubmissionModal,
  useFactory: (i) => i.get('UploadSubmissionModal'),
  deps: ['$injector'],
};

export const gradeTaskModalProvider = {
  provide: gradeTaskModal,
  useFactory: (i) => i.get('GradeTaskModal'),
  deps: ['$injector'],
};

export const analyticsServiceProvider = {
  provide: analyticsService,
  useFactory: (i) => i.get('analyticsService'),
  deps: ['$injector'],
};

export const dateServiceProvider = {
  provide: dateService,
  useFactory: (i) => i.get('dateService'),
  deps: ['$injector'],
};

export const AudioRecorderProvider = {
  provide: audioRecorder,
  useFactory: (i) => i.get('audioRecorder'),
  deps: ['$injector'],
};

export const AudioRecorderServiceProvider = {
  provide: audioRecorderService,
  useFactory: (i) => i.get('recorderService'),
  deps: ['$injector'],
};

export const CsvUploadModalProvider = {
  provide: csvUploadModalService,
  useFactory: (i) => i.get('CsvUploadModal'),
  deps: ['$injector'],
};

export const CsvResultModalProvider = {
  provide: csvResultModalService,
  useFactory: (i) => i.get('CsvResultModal'),
  deps: ['$injector'],
};

export const ConfirmationModalProvider = {
  provide: confirmationModal,
  useFactory: (i) => i.get('ConfirmationModal'),
  deps: ['$injector'],
};

export const UnitStudentEnrolmentModalProvider = {
  provide: unitStudentEnrolmentModal,
  useFactory: (i) => i.get('UnitStudentEnrolmentModal'),
  deps: ['$injector'],
};
