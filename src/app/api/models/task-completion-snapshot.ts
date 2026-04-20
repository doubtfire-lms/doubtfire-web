export type TaskCompletionSnapshot = {
  snapshot_date: string;
  snapshot_timestamp: string;
  stats: CampusStats;
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
