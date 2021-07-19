import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { alertService, taskService, Task } from 'src/app/ajs-upgraded-providers';
import { Observable } from 'rxjs';
import { TaskAssessmentComment } from 'src/app/tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component';
import { map } from 'rxjs/operators';
import { OverseerAssessment, OverseerAssessmentService, OverseerImage, OverseerImageService } from 'src/app/api/models/doubtfire-model';

export interface TaskAssessmentResult {
  id?: number;
  assessment_output?: string;
  is_completed?: boolean;
  is_successful?: boolean;
  assessment_date?: Date;
  tests?: TestResult[];
  task?: any;
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

export interface DockerImageInfo {
  name: string;
  packages?: string[];
  doc_links?: string[];
  tags?: string[];
  info: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskSubmissionService {
  private readonly _API_URL = this.constants.API_URL;

  private readonly overseerImagesEndpointFormat = 'admin/overseer_images';

  constructor(
    // @Inject(taskService) private ts: any,
    @Inject(Task) private TaskLegacy: any,
    @Inject(alertService) private alerts: any,
    private http: HttpClient,
    private constants: DoubtfireConstants,
    private overseerImages: OverseerImageService,
    private overseerAssessmentService: OverseerAssessmentService
    ) { }

  public getLatestTaskAssessment(taskInfo: TaskInfo): Observable<any> {
    const url = this.TaskLegacy.generateLatestAssessmentUrl(taskInfo);
    return this.http.get<any>(url);
  }

  public getLatestSubmissionsTimestamps(taskInfo: TaskInfo): Observable<OverseerAssessment[]> {
    return this.overseerAssessmentService.queryForTask(taskInfo);
  }

  public getSubmissionByTimestamp(taskInfo: TaskInfo, timestamp: string): Observable<any> {
    const url = this.TaskLegacy.getSubmissionByTimestampUrl(taskInfo, timestamp);
    return this.http.get<any>(url);
  }

  public getDockerImages(): Observable<OverseerImage[]> {
    return this.overseerImages.query();
  }

  public getDockerImagesAsPromise() {
    return this.getDockerImages()
       .toPromise();
  }
}
