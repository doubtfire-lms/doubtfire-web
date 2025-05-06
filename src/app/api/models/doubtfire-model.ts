// Export all model objects and services for use by other components

// Comments -- tasks have many comments
export * from './task-comment/task-comment';
export * from '../services/task-comment.service';

// Tutorials -- units have many tutorials, organised in streams, with certain types, at certain locations
export * from './activity-type/activity-type';
export * from '../services/activity-type.service';
export * from './campus/campus';
export * from './overseer/overseer-image';
export * from '../services/overseer-image.service';
export * from './overseer/overseer-assessment';
export * from './tutorial/tutorial';
export * from './tutorial-stream/tutorial-stream';
export * from './teaching-period';
export * from './unit';
export * from './project';
export * from './task';
export * from './task-definition';
export * from './learning-outcome';
export * from './tutorial-enrolment';
export * from './unit-role';
export * from './groups/group';
export * from './groups/group-set';
export * from './groups/group-membership';
export * from './task-outcome-alignment';
export * from './learning-outcome';
export * from './grade';
export * from './task-status';
export * from './task-comment/discussion-comment';
export * from '../services/task-outcome-alignment.service';
export * from './task-similarity';
export * from './tii-action';
export * from './scorm-datamodel';
export * from './scorm-player-context';
export * from './test-attempt';
export * from './task-comment/scorm-comment';
export * from './task-comment/scorm-extension-comment';

// Users -- are students or staff
export * from './user/user';

// WebCal -- calendars used to track task due dates
export * from './webcal/webcal';


export * from '../services/authentication.service';
export * from '../services/unit.service';
export * from '../services/project.service';
export * from '../services/task.service';
export * from '../services/tutorial.service';
export * from '../services/tutorial-stream.service';
export * from '../services/overseer-assessment.service';
export * from '../services/campus.service';
export * from '../services/user.service';
export * from '../services/unit-role.service';
export * from '../services/webcal.service';
export * from '../services/teaching-period.service';
export * from '../services/teaching-period-break.service';
export * from '../services/learning-outcome.service';
export * from '../services/group-set.service';
export * from '../services/task-similarity.service';
export * from '../../common/services/grade.service';
export * from '../services/test-attempt.service';
