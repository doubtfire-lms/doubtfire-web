import { Component, OnInit, Inject, Input, ViewEncapsulation } from '@angular/core';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';
import { map } from 'rxjs/operators';
import { Timestamp, timestamp } from 'rxjs/internal/operators/timestamp';
import { TaskSubmissionTabContentComponent } from './task-submission-tab-content.component';

export interface ISubmissionTab {
  id?: number;
  timestamp: Date;
  timestampString?: string;
  content?: string;
  task?: any;
}

export class SubmissionTab implements ISubmissionTab {
  timestamp = new Date();
  id?: number;
  timestampString?: string;
  content?: string;
  task?: any;
  constructor() {}
}

@Component({
  selector: 'task-submission-history',
  templateUrl: './task-submission-history.component.html',
  styleUrls: ['./task-submission-history.component.scss'],
})
export class TaskSubmissionHistoryComponent implements OnInit {
  @Input() task: any;
  tabs: SubmissionTab[];
  timestamps: string[];
  selectedTab: SubmissionTab = new SubmissionTab();

  constructor(
    @Inject(TaskSubmissionService) private submissions: TaskSubmissionService,
  ) { }

  ngOnInit() {
    this.fillTabs();
  }

  fillTabs(): void {
    this.submissions.getLatestSubmissionsTimestamps(this.task);
    let transformedData = this.submissions.getLatestSubmissionsTimestamps(this.task).pipe(
      map(data => {
        // console.log(data.result, data.result.length);
        return data.result.map((ts: number) => {
          // console.log(timestamp);
          return { timestamp: new Date(ts * 1000), content: '', timestampString: ts };
        });
      })
    );

    transformedData.subscribe(
      tabs => {
        this.tabs = tabs;
        if (!tabs.length) {
          this.tabs.push({timestamp: new Date(), content: 'There are no submissions for this task at the moment.' });
        }
        console.log(tabs);
      },
      error => {
        console.log(error);
        /// TODO: alert service call
      }
    );
  }

  openSubmission(tab: SubmissionTab) {
    this.selectedTab.timestamp = tab.timestamp;
    this.selectedTab.timestampString = tab.timestampString;
    this.submissions.getSubmissionByTimestamp(this.task, tab.timestampString)
      .subscribe(
        sub => {
          this.selectedTab.content = sub.result;
        },
        error => {
          /// TODO: add alert service call here. Maybe HTTP interceptor error handling is enough.
          this.selectedTab.content = error;
        }
      );
  }
}
