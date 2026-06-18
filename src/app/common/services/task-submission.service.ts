import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  OverseerAssessment,
  OverseerAssessmentService,
  OverseerImage,
  OverseerImageService,
  Task,
} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

export interface TaskAssessmentResult {
  id?: number;
  assessment_output?: string;
  is_completed?: boolean;
  is_successful?: boolean;
  assessment_date?: Date;
  tests?: TestResult[];
  task?: Task;
}

export interface TestResult {
  id: number;
  test_name?: string;
  is_successful: boolean;
}

export interface TaskAssessmentResponse {
  result: string;
}

export interface SubmissionResult {
  label: string;
  result: string;
}

export interface DockerImageInfo {
  name: string;
  packages?: string[];
  doc_links?: string[];
  tags?: string[];
  info: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskSubmissionService {
  private readonly _API_URL = this.constants.API_URL;

  private readonly overseerImagesEndpointFormat = 'admin/overseer_images';

  constructor(
    private http: HttpClient,
    private constants: DoubtfireConstants,
    private overseerImages: OverseerImageService,
    private overseerAssessmentService: OverseerAssessmentService,
  ) {}

  public getLatestTaskAssessment(taskInfo: Task): Observable<TaskAssessmentResponse> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${
      taskInfo.project.id
    }/task_def_id/${taskInfo.definition.id}/submissions/latest`;
    return this.http.get<TaskAssessmentResponse>(url);
  }

  public getLatestSubmissionsTimestamps(taskInfo: Task): Observable<OverseerAssessment[]> {
    return this.overseerAssessmentService.queryForTask(taskInfo);
  }

  public getSubmissionByTimestamp(
    taskInfo: Task,
    timestamp: string,
  ): Observable<SubmissionResult[]> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/projects/${
      taskInfo.project.id
    }/task_def_id/${taskInfo.definition.id}/submissions/timestamps/${timestamp}`;
    return this.http.get<SubmissionResult[]>(url);
  }

  public getDockerImages(): Observable<OverseerImage[]> {
    return this.overseerImages.query();
  }

  public getDockerImagesAsPromise() {
    return this.getDockerImages().toPromise();
  }
}
