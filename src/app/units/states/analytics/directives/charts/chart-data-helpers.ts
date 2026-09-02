import {
  CampusStats,
  TaskCodeStats,
  TaskCompletionSnapshot,
  TaskStatusEnum,
  TutorialStats,
} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';

// Snapshots can predate the teaching period; fold those into week 0 rather than showing 'Week -2'.
export function displayWeekNumber(unit: Unit, date: Date | string): number | null {
  const weekNumber = unit.weekNumber(date);
  return weekNumber === null ? null : Math.max(weekNumber, 0);
}

export function formatSnapshotLabel(unit: Unit, snapshotDate?: string, format?: string): string {
  if (!snapshotDate) {
    return '';
  }

  const date = new Date(snapshotDate);
  if (Number.isNaN(date.valueOf())) {
    return snapshotDate;
  }

  const weekNumber = displayWeekNumber(unit, date);
  const dayName = new Intl.DateTimeFormat(undefined, {weekday: 'short'}).format(date);

  if (!format) {
    return `${dayName} ${date.toLocaleDateString(undefined, {
      month: 'numeric',
      day: 'numeric',
    })}`;
  } else if (format === 'short') {
    return `Week ${weekNumber}`;
  } else if (format === 'long') {
    return `${date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} | Week ${weekNumber}`;
  }
}

// Order determines the order of the chart legend and series.
export const statusMapping: TaskStatusEnum[] = [
  'complete',
  'assess_in_portfolio',
  'discuss',
  'demonstrate',
  'redo',
  'fix_and_resubmit',
  'ready_for_feedback',
  'working_on_it',
  'need_help',
  'attention_required',
  'time_exceeded',
  'feedback_exceeded',
  'fail',
  'not_started',
];

export function countStudentsFromSnapshot(snapshotData: CampusStats): number {
  return Object.values(snapshotData).reduce((acc, campusData) => {
    const campusStudentCount = Object.values(campusData).reduce((campusAcc, tutorialData) => {
      const firstTaskStats = Object.values(tutorialData)[0];
      const tutorialStudentCount = firstTaskStats
        ? Object.values(firstTaskStats).reduce((acc, count) => acc + count, 0)
        : 0;
      return campusAcc + tutorialStudentCount;
    }, 0);
    return acc + campusStudentCount;
  }, 0);
}

export function mergeTaskCounts(target: TaskCodeStats, source: TaskCodeStats): void {
  Object.entries(source).forEach(([taskDef, counts]) => {
    target[taskDef] = target[taskDef] || {};
    Object.entries(counts).forEach(([status, value]) => {
      target[taskDef][status] = (target[taskDef][status] || 0) + value;
    });
  });
}

export function aggregateCampusData(campusData: TutorialStats): TaskCodeStats {
  return Object.values(campusData).reduce((acc, tutorialData) => {
    mergeTaskCounts(acc, tutorialData);
    return acc;
  }, {} as TaskCodeStats);
}

export function aggregateAllCampuses(
  snapshotStats: TaskCompletionSnapshot['stats'],
): TaskCodeStats {
  return Object.values(snapshotStats).reduce((acc, campusData) => {
    mergeTaskCounts(acc, aggregateCampusData(campusData));
    return acc;
  }, {} as TaskCodeStats);
}

export function getTaskStats(
  snapshot: TaskCompletionSnapshot,
  campusFilter: string = 'all',
): TaskCodeStats {
  return campusFilter !== 'all' && snapshot.stats[campusFilter]
    ? aggregateCampusData(snapshot.stats[campusFilter])
    : aggregateAllCampuses(snapshot.stats);
}

export function isPreWeekZeroSnapshot(unit: Unit, snapshot: TaskCompletionSnapshot): boolean {
  const snapshotDate = new Date(snapshot.snapshot_date);
  if (Number.isNaN(snapshotDate.valueOf())) {
    return false;
  }

  return (unit.weekNumber(snapshotDate) ?? 0) < 0;
}

export function hasOnlyNotStartedStatuses(snapshot: TaskCompletionSnapshot): boolean {
  const aggregatedTaskStats = aggregateAllCampuses(snapshot.stats);
  const taskStatusEntries = Object.values(aggregatedTaskStats);

  if (taskStatusEntries.length === 0) {
    return false;
  }

  return taskStatusEntries.every((taskStatusCounts) =>
    Object.entries(taskStatusCounts).every(
      ([status, value]) => status === 'not_started' || Number(value) === 0,
    ),
  );
}

export function shouldIncludeSnapshot(unit: Unit, snapshot: TaskCompletionSnapshot): boolean {
  return !(isPreWeekZeroSnapshot(unit, snapshot) && hasOnlyNotStartedStatuses(snapshot));
}

export function isEmptySnapshot(snapshot: TaskCompletionSnapshot): boolean {
  return Object.values(aggregateAllCampuses(snapshot.stats)).every((taskStatusCounts) =>
    Object.values(taskStatusCounts).every((value) => Number(value) === 0),
  );
}

export function dropLeadingEmptySnapshots(
  snapshots: TaskCompletionSnapshot[],
): TaskCompletionSnapshot[] {
  const firstPopulated = snapshots.findIndex((snapshot) => !isEmptySnapshot(snapshot));
  return firstPopulated <= 0 ? snapshots : snapshots.slice(firstPopulated);
}
