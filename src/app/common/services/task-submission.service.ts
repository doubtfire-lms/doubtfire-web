import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { alertService, taskService, Task } from 'src/app/ajs-upgraded-providers';

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
  tutorial_id: number;
  task_definition_id: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskSubmissionService {
  constructor(
    // @Inject(taskService) private ts: any,
    // @Inject(Task) private TaskLegacy: any,
    @Inject(alertService) private alerts: any,
    private http: HttpClient,
    private constants: DoubtfireConstants,
     ) { }

  public getLatestTaskAssessment(taskInfo: TaskInfo): TaskAssessmentResult {

    const preformattedText = `Test A: Create a new vector by calling 'Vector<int> vector = new Vector<int>(50);'
    :: FAIL
   System.Exception: Vector has a wrong capacity
      at Vector.Tester.Main(String[] args) in /Users/akashagarwal/ruby/docker-tests/csharp/lazarus_pit/Tester.cs:line 30
   Test B: Add a sequence of numbers 2, 6, 8, 5, 5, 1, 8, 5, 3, 5
    :: SUCCESS
   Test C: Run a sequence of operations:
   Find number that is greater than 3 and less than 7, i.e. 'e => e > 3 && e < 7'
    :: SUCCESS
   Find number that is either 10 or 8, i.e. 'e => e == 10 || e == 8'
    :: SUCCESS
   Find number that is not 2, i.e. 'e => e != 2'
    :: SUCCESS
   Find number that is greater than 20, i.e. 'e => e > 20'
    :: SUCCESS
   Find the first odd number, i.e. 'e => (e % 2) == 1'
    :: SUCCESS
   Find the number that is divided by 11 without remainder, i.e. 'e => (e % 11) == 0'
    :: SUCCESS
   Test DFind the minimum of the sequence
    :: SUCCESS
   Test E: Find the maximum of the sequence
    :: SUCCESS
   Test F: Find all numbers that are greater than 3 and less than 7, i.e. 'e => e > 3 && e < 7'
    :: SUCCESS
   Test G: Find all numbers that is either 10 or 8, i.e. 'e => e == 10 || e == 8'
    :: SUCCESS
   Test H: Find all odd numbers, i.e. 'e => (e % 2) == 1'
    :: SUCCESS
   Test I: Find all odd numbers that are divided by 11 without remainder, i.e. 'e => (e % 11) == 0'
    :: SUCCESS
   Test J: Remove all even numbers, i.e. 'e => (e % 2) == 0'
    :: SUCCESS
    ------------------- SUMMARY -------------------
   Tests passed: -BCDEFGHIJ"`;
    const dummyRes: TaskAssessmentResult = {
      id : 1,
      assessment_output : preformattedText,
      is_completed: true,
      is_successful: true,
    };
    return dummyRes;

    // const API_URL = this.constants.API_URL;
    // const url = this.TaskLegacy.generateTaskAssessmentURL(t);
    // return this.http.get<TaskAssesment>('URL');
  }

  // createTaskAssessmentComment(res: TaskAssessmentResult): TaskAssessmentComment {
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
  //       is_completed: res.is_completed,
  //       is_successful: res.is_successful,
  //       assessment_output: res.assessment_output,
  //     }
  // };
  // return dummyComment;
  // }

  // testPassingThingsBetweenCoffeeAndTS(param: any): any {
  //   const dummy = param;
  // return dummy;
  // }
}
