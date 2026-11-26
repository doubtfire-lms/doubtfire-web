export type TaskCompletionSnapshot = {
  snapshot_date: string;
  snapshot_timestamp: string;
  stats: CampusStats;
  target_grade_stats?: Record<string, CampusStats>;
  status_population_stats?: {
    all: CampusStats;
    target_grades: Record<string, CampusStats>;
  };
  student_count?: number;
  campus_student_counts?: Record<string, number>;
  target_grade_student_counts?: Record<string, number>;
  target_grade_campus_student_counts?: Record<string, Record<string, number>>;
  /**
   * Set on a synthetic empty day before week 0 data when no captured empty day exists.
   * Never sent by the API.
   */
  placeholder?: boolean;
  submitted_task_count_student_counts?: {
    task_grade_values?: number[];
    all: Record<string, Record<string, Record<string, number>>>;
    target_grades: Record<string, Record<string, Record<string, Record<string, number>>>>;
  };
};

export type TaskStatusCounts = {
  [status: string]: number;
  // e.g. complete?: number;
  //      not_started?: number;
  //      ready_for_feedback?: number;
};

export type TaskCodeStats = {
  [taskCode: string]: TaskStatusCounts;
  // e.g. "T1": {complete: 10, not_started: 5, ready_for_feedback: 3}
};

export type TutorialStats = {
  [tutorialCode: string]: TaskCodeStats;
  // e.g. "LA1-01"
};

export type CampusStats = {
  [campusName: string]: TutorialStats;
  // e.g. "Online", "Burwood"
};

type NestedCounts = {[key: string]: number | NestedCounts};

function sumInto(target: NestedCounts, source: NestedCounts): NestedCounts {
  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === 'number') {
      target[key] = ((target[key] as number) ?? 0) + value;
    } else {
      target[key] ??= {};
      sumInto(target[key] as NestedCounts, value);
    }
  });
  return target;
}

function sumScopes<T>(scopes: Record<string, T>): T {
  return Object.values(scopes).reduce(
    (total, scope) => sumInto(total, scope as NestedCounts),
    {} as NestedCounts,
  ) as T;
}

// Plain status stats are the population tutorial buckets without the '__all__' campus total.
function withoutCampusTotals(stats: CampusStats): CampusStats {
  return Object.fromEntries(
    Object.entries(stats).map(([campus, tutorials]) => [
      campus,
      Object.fromEntries(Object.entries(tutorials).filter(([tutorial]) => tutorial !== '__all__')),
    ]),
  );
}

/**
 * The API stores only per target grade scopes; rebuild the whole-cohort and plain status views
 * the charts read. Tutorial objects are shared with the population stats, not copied.
 */
export function expandTaskCompletionSnapshot(
  snapshot: TaskCompletionSnapshot,
): TaskCompletionSnapshot {
  const population = snapshot.status_population_stats;
  const submitted = snapshot.submitted_task_count_student_counts;
  if (!population?.target_grades) {
    return snapshot;
  }

  const all = sumScopes(population.target_grades);
  return {
    ...snapshot,
    stats: withoutCampusTotals(all),
    target_grade_stats: Object.fromEntries(
      Object.entries(population.target_grades).map(([grade, stats]) => [
        grade,
        withoutCampusTotals(stats),
      ]),
    ),
    status_population_stats: {...population, all},
    submitted_task_count_student_counts: submitted?.target_grades
      ? {...submitted, all: sumScopes(submitted.target_grades)}
      : submitted,
  };
}
