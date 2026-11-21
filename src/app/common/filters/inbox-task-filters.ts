import type {Task} from 'src/app/api/models/task';
import type {TaskStatusEnum} from 'src/app/api/models/task-status';

/** Shared by the inbox's status controls and the unit dashboard counters. */
export function matchesInboxStatuses(task: Task, statuses: readonly TaskStatusEnum[]): boolean {
  return statuses.length === 0 || (!!task?.status && statuses.includes(task.status));
}

/** Uses the existing feedback age calculation, including pauses for teaching breaks. */
export function feedbackWarningFor(task: Task): 'warning' | 'overflow' | null {
  if (!task?.submissionDate || !matchesInboxStatuses(task, ['ready_for_feedback'])) {
    return null;
  }

  const days = task.daysSinceSubmission();
  if (days >= task.unit.feedbackOverflowThresholdDays) {
    return 'overflow';
  }
  if (days >= task.unit.feedbackWarningThresholdDays) {
    return 'warning';
  }
  return null;
}
