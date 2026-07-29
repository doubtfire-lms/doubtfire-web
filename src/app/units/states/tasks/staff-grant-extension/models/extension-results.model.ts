export interface SuccessfulResult {
  student_id: number;
  project_id: number;
  weeks_requested: number;
  extension_response: string;
  task_status: string;
}

export interface FailedResult {
  student_id: number;
  project_id: number;
  error: string;
}

export interface SkippedResult {
  student_id: number;
  reason: string;
}

export interface ExtensionServiceResult {
  successful: SuccessfulResult[];
  failed: FailedResult[];
  skipped: SkippedResult[];
}

export interface ExtensionSummaryPayload {
  results: ExtensionServiceResult;
  weeksRequested: number;
  createdAt: string; // ISO string
  taskDefinitionId: number;
}
