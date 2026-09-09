import {describe, expect, it} from 'vitest';
import {TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {
  displayWeekNumber,
  dropLeadingEmptySnapshots,
  formatSnapshotLabel,
  isEmptySnapshot,
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
});

describe('dropLeadingEmptySnapshots', () => {
  it('drops only the leading run of empty snapshots', () => {
    const snapshots = [
      snapshot('2025-02-17'),
      snapshot('2025-02-18'),
      snapshot('2025-03-07', {not_started: 40}),
      snapshot('2025-03-08'), // empty mid-semester: kept, so week widths stay true
      snapshot('2025-03-09', {complete: 3, not_started: 37}),
    ];

    expect(dropLeadingEmptySnapshots(snapshots).map((s) => s.snapshot_date)).toEqual([
      '2025-03-07',
      '2025-03-08',
      '2025-03-09',
    ]);
  });

  it('leaves a list that starts with data alone', () => {
    const snapshots = [snapshot('2025-03-07', {complete: 1}), snapshot('2025-03-08')];
    expect(dropLeadingEmptySnapshots(snapshots)).toBe(snapshots);
  });

  it('keeps everything when every snapshot is empty', () => {
    const snapshots = [snapshot('2025-02-17'), snapshot('2025-02-18')];
    expect(dropLeadingEmptySnapshots(snapshots)).toBe(snapshots);
  });
});
