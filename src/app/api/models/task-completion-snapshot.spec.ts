import {TaskCompletionSnapshot, expandTaskCompletionSnapshot} from './task-completion-snapshot';

describe('expandTaskCompletionSnapshot', () => {
  const snapshot: TaskCompletionSnapshot = {
    snapshot_date: '2026-04-01',
    snapshot_timestamp: '1775001600',
    stats: undefined,
    status_population_stats: {
      all: undefined,
      target_grades: {
        '0': {Burwood: {__all__: {T1: {complete: 2}}, 'LA1-01': {T1: {complete: 2}}}},
        '3': {
          Burwood: {__all__: {T1: {complete: 1, not_started: 1}}, 'LA1-02': {T1: {not_started: 1}}},
          Online: {__all__: {T1: {complete: 1}}, 'OL-01': {T1: {complete: 1}}},
        },
      },
    },
    submitted_task_count_student_counts: {
      task_grade_values: [0, 1, 2, 3],
      all: undefined,
      target_grades: {
        '0': {Burwood: {__all__: {'1,0,0,0': 2}}},
        '3': {Burwood: {__all__: {'1,0,0,0': 1, '0,0,0,0': 1}}},
      },
    },
  };

  it('sums target grade scopes into whole-cohort scopes', () => {
    const expanded = expandTaskCompletionSnapshot(snapshot);

    expect(expanded.status_population_stats.all).toEqual({
      Burwood: {
        __all__: {T1: {complete: 3, not_started: 1}},
        'LA1-01': {T1: {complete: 2}},
        'LA1-02': {T1: {not_started: 1}},
      },
      Online: {__all__: {T1: {complete: 1}}, 'OL-01': {T1: {complete: 1}}},
    });
    expect(expanded.submitted_task_count_student_counts.all).toEqual({
      Burwood: {__all__: {'1,0,0,0': 3, '0,0,0,0': 1}},
    });
  });

  it('rebuilds plain status stats from tutorial buckets', () => {
    const expanded = expandTaskCompletionSnapshot(snapshot);

    expect(expanded.stats).toEqual({
      Burwood: {'LA1-01': {T1: {complete: 2}}, 'LA1-02': {T1: {not_started: 1}}},
      Online: {'OL-01': {T1: {complete: 1}}},
    });
    expect(expanded.target_grade_stats['3']).toEqual({
      Burwood: {'LA1-02': {T1: {not_started: 1}}},
      Online: {'OL-01': {T1: {complete: 1}}},
    });
  });

  it('does not change the stored target grade scopes', () => {
    expandTaskCompletionSnapshot(snapshot);

    expect(snapshot.status_population_stats.target_grades['0'].Burwood.__all__.T1).toEqual({
      complete: 2,
    });
  });
});
