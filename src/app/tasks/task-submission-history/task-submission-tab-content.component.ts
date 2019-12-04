import { Component, OnInit, Inject, Input } from '@angular/core';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export interface SubmissionTab {
  id?: number;
  timestamp: Date;
  content?: string;
}

@Component({
  selector: 'task-submission-tab-content',
  templateUrl: './task-submission-tab-content.component.html',
  styleUrls: ['./task-submission-tab-content.component.scss']
})
export class TaskSubmissionTabContentComponent implements OnInit {
  @Input() task: any;
  @Input() timestamp: string;
  content: string;

  constructor(
    @Inject(TaskSubmissionService) private submissions: TaskSubmissionService,
  ) { }

  ngOnInit() {
    this.submissions.getSubmissionByTimestamp(this.task, this.timestamp)
    // .pipe(
    //   catchError(this.handleError)
    // )
    .subscribe(
      sub => {
        this.content = sub.result;
      },
      error => {
        /// TODO: add alert service call here.
        console.log(error);
        this.content = error;
      }
    );
  }

  // Catching an error
  private handleError(error: HttpErrorResponse) {
    // client-side error processing
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
    } else {
      // server-side error processing
      console.error(
        `Error Code: ${error.status}, ` +
        `Error Response: ${error.error}`);
    }

    return throwError(error.error);
  }
}
