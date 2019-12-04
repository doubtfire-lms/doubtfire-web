import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { alertService, taskService, Task } from 'src/app/ajs-upgraded-providers';
import { Observable } from 'rxjs';
import { TaskAssessmentComment } from 'src/app/tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component';

export interface TaskAssessmentResult {
  id?: number;
  assessment_output?: string;
  is_completed?: boolean;
  is_successful?: boolean;
  assessment_date?: Date;
  tests?: TestResult[];
}

export interface TestResult {
  id: number;
  test_name?: string;
  is_successful: boolean;
}

export interface TaskInfo {
  id: number;
  project_id?: number;
  tutorial_id?: number;
  task_definition_id: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskSubmissionService {
  constructor(
    // @Inject(taskService) private ts: any,
    @Inject(Task) private TaskLegacy: any,
    @Inject(alertService) private alerts: any,
    private http: HttpClient,
    private constants: DoubtfireConstants,
     ) { }

  public getLatestTaskAssessment(taskInfo: TaskInfo): Observable<any> {
    const API_URL = this.constants.API_URL;
    const url = this.TaskLegacy.generateLatestAssessmentUrl(taskInfo);
    return this.http.get<any>(url);
  }

  public getLatestSubmissionsTimestamps(taskInfo: TaskInfo): Observable<any> {
    const API_URL = this.constants.API_URL;
    const url = this.TaskLegacy.getLatestTimestampsUrl(taskInfo);
    return this.http.get<any>(url);
  }

  public getSubmissionByTimestamp(taskInfo: TaskInfo, timestamp: string): Observable<any> {
    const API_URL = this.constants.API_URL;
    const url = this.TaskLegacy.getSubmissionByTimestampUrl(taskInfo, timestamp);
    return this.http.get<any>(url);
  }
}
