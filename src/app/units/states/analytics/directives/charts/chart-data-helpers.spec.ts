import {describe, expect, it} from 'vitest';
import {TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {
  displayWeekNumber,
  filterEmptySnapshots,
  formatSnapshotLabel,
  getEmptySnapshotTaskStats,
  getTaskPopulationStats,
  isEmptySnapshot,
  shouldIncludeSnapshot,
} from './chart-data-helpers';

const unitStartingOn = (start: string): Unit =>
  ({
    weekNumber: (date: Date | string) => {
      const target = date instanceof Date ? date : new Date(date);
      const startDate = new Date(start);
      return Math.floor((target.valueOf() - startDate.valueOf()) / (1000 * 60 * 60 * 24 * 7)) + 1;
    },
  }) as Unit;

const snapshot = (date: string, counts?: Record<string, number>): TaskCompletionSnapshot => ({
  snapshot_date: date,
  snapshot_timestamp: String(new Date(date).valueOf()),
  stats: counts ? {Burwood: {'LA1-01': {T1: counts}}} : {},
});

describe('displayWeekNumber', () => {
  const unit = unitStartingOn('2025-03-03');

  it('folds every week before week 1 into week 0', () => {
    expect(displayWeekNumber(unit, '2025-02-24')).toBe(0); // raw week 0
    expect(displayWeekNumber(unit, '2025-02-17')).toBe(0); // raw week -1
    expect(displayWeekNumber(unit, '2025-01-06')).toBe(0); // raw week -6
  });

  it('leaves teaching weeks untouched', () => {
    expect(displayWeekNumber(unit, '2025-03-03')).toBe(1);
    expect(displayWeekNumber(unit, '2025-05-19')).toBe(12);
  });

  it('passes through a null week number', () => {
    expect(displayWeekNumber({weekNumber: () => null} as unknown as Unit, '2025-03-03')).toBeNull();
  });

  it('never labels a snapshot with a negative week', () => {
    expect(formatSnapshotLabel(unit, '2025-02-17', 'short')).toBe('Week 0');
    expect(formatSnapshotLabel(unit, '2025-02-17', 'long')).toContain('Week 0');
  });
});

describe('isEmptySnapshot', () => {
  it('treats a snapshot with no campuses as empty', () => {
    expect(isEmptySnapshot(snapshot('2025-02-17'))).toBe(true);
  });

  it('treats all-zero counts as empty', () => {
    expect(isEmptySnapshot(snapshot('2025-02-17', {not_started: 0, complete: 0}))).toBe(true);
  });

  it('does not treat an all-not-started cohort as empty', () => {
    expect(isEmptySnapshot(snapshot('2025-03-03', {not_started: 40}))).toBe(false);
  });

  it('uses campus-wide counts when students have no tutorials', () => {
    const withoutTutorials = {
      ...snapshot('2025-03-03'),
      status_population_stats: {
        all: {Burwood: {__all__: {T1: {complete: 2, not_started: 38}}}},
        target_grades: {},
      },
    };

    expect(isEmptySnapshot(withoutTutorials)).toBe(false);
    expect(getTaskPopulationStats(withoutTutorials, 'all', 'all', [], [], {} as Unit)).toEqual({
      T1: {complete: 2, not_started: 38},
    });
  });
});

describe('filterEmptySnapshots', () => {
  it('keeps only the last empty snapshot before data begins', () => {
    const snapshots = [
      snapshot('2025-02-17'),
      snapshot('2025-02-18'),
      snapshot('2025-03-07', {not_started: 40}),
      snapshot('2025-03-08'),
      snapshot('2025-03-09', {complete: 3, not_started: 37}),
    ];

    expect(filterEmptySnapshots(snapshots).map((s) => s.snapshot_date)).toEqual([
      '2025-02-18',
      '2025-03-07',
      '2025-03-09',
    ]);
  });

  it('drops later empty days when the series starts with data', () => {
    const snapshots = [snapshot('2025-03-07', {complete: 1}), snapshot('2025-03-08')];
    expect(filterEmptySnapshots(snapshots)).toEqual([snapshots[0]]);
  });

  it('keeps the latest snapshot when every snapshot is empty', () => {
    const snapshots = [snapshot('2025-02-17'), snapshot('2025-02-18')];
    expect(filterEmptySnapshots(snapshots)).toEqual([snapshots[1]]);
  });

  it('keeps a populated snapshot without tutorials', () => {
    const snapshots = [
      snapshot('2025-03-03'),
      {
        ...snapshot('2025-03-04'),
        status_population_stats: {
          all: {Burwood: {__all__: {T1: {complete: 2}}}},
          target_grades: {},
        },
      },
    ];

    expect(filterEmptySnapshots(snapshots).map((entry) => entry.snapshot_date)).toEqual([
      '2025-03-03',
      '2025-03-04',
    ]);
  });

  it('treats all-not-started students as data', () => {
    const allNotStarted = {
      ...snapshot('2025-02-19'),
      status_population_stats: {
        all: {Burwood: {__all__: {T1: {not_started: 40}}}},
        target_grades: {},
      },
    };

    expect(
      filterEmptySnapshots([snapshot('2025-02-17'), snapshot('2025-02-18'), allNotStarted]).map(
        (entry) => entry.snapshot_date,
      ),
    ).toEqual(['2025-02-18', '2025-02-19']);
  });
});

describe('getEmptySnapshotTaskStats', () => {
  it('shows every task as not started while respecting the task grade filter', () => {
    const unit = {
      taskDefinitions: [
        {abbreviation: 'P1', targetGrade: 0},
        {abbreviation: 'C1', targetGrade: 1},
      ],
    } as unknown as Unit;

    expect(getEmptySnapshotTaskStats(unit, [])).toEqual({
      P1: {not_started: 1},
      C1: {not_started: 1},
    });
    expect(getEmptySnapshotTaskStats(unit, [1])).toEqual({C1: {not_started: 1}});
  });
});

describe('shouldIncludeSnapshot', () => {
  const unit = unitStartingOn('2025-03-03');

  it('keeps pre-teaching snapshots with progress and no tutorials', () => {
    const withProgress = {
      ...snapshot('2025-02-24'),
      status_population_stats: {
        all: {Burwood: {__all__: {T1: {complete: 2, not_started: 38}}}},
        target_grades: {},
      },
    };

    expect(shouldIncludeSnapshot(unit, withProgress)).toBe(true);
  });
});

describe('getTaskPopulationStats', () => {
  it('uses unique all-tutorial counts and respects tutorial and target-grade filters', () => {
    const unit = {
      taskDefinitions: [{abbreviation: 'T1', targetGrade: 0}],
    } as unknown as Unit;
    const selectedSnapshot = {
      ...snapshot('2025-03-07'),
      stats: {Burwood: {T1: {T1: {complete: 2}}, T2: {T1: {complete: 1}}}},
      status_population_stats: {
        all: {
          Burwood: {
            __all__: {T1: {complete: 2, not_started: 1}},
            T1: {T1: {complete: 2, not_started: 1}},
            T2: {T1: {complete: 1}},
          },
        },
        target_grades: {
          '0': {Burwood: {__all__: {T1: {complete: 1}}, T2: {T1: {complete: 1}}}},
        },
      },
    } as TaskCompletionSnapshot;

    expect(getTaskPopulationStats(selectedSnapshot, 'all', 'all', [], [], unit)).toEqual({
      T1: {complete: 2, not_started: 1},
    });
    expect(getTaskPopulationStats(selectedSnapshot, 'Burwood', 'T2', [], [0], unit)).toEqual({
      T1: {complete: 1},
    });
  });
});
