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

  // createTaskAssessmentComment(taskInfo: TaskInfo): TaskAssessmentComment {
  //   const dummyComment: TaskAssessmentComment = {
  //     id: 888,
  //     comment: '',
  //     has_attachment: false,
  //     type: 'assessment',
  //     is_new: true,
  //     author: {
  //         id: 1,
  //         name: 'Andrew Cain',
  //         email: 'acain@doubtfire.com'
  //     },
  //     recipient: {
  //         id: 2,
  //         name: 'Clinton Woodward',
  //         email: 'acain@doubtfire.com'
  //     },
  //     created_at: '2019-11-21T04:49:56.797Z',
  //     assessment_result: {
  //       is_completed: true,
  //       is_successful: true,
  //       assessment_output: 'Long_Output_Here',
  //     }
  //   };
  //   // let assessmentRes = this.getLatestTaskAssessment(taskInfo).subscribe(
  //   //   res => {
  //   //     console.log(res);
  //   //     dummyComment.assessment_result.assessment_output = res.result;
  //   //   },
  //   //   err => {
  //   //     console.log(err.error);
  //   //   }
  //   // );
  //   return dummyComment;
  // }

  // testPassingThingsBetweenCoffeeAndTS(param: any): any {
  //   const dummy = param;
  // return dummy;
  // }
}
