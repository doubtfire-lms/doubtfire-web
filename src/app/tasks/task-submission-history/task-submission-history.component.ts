import { Component, OnInit, Inject, Input } from '@angular/core';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';
import { map } from 'rxjs/operators';
import { Timestamp } from 'rxjs/internal/operators/timestamp';

export interface SubmissionTab {
  id?: number;
  timestamp: Date;
  timestampString?: string;
  content?: string;
  task?: any;
}

@Component({
  selector: 'task-submission-history',
  templateUrl: './task-submission-history.component.html',
  styleUrls: ['./task-submission-history.component.scss']
})
export class TaskSubmissionHistoryComponent implements OnInit {
  @Input() task: any;
  tabs: SubmissionTab[];
  timestamps: string[];

  constructor(
    @Inject(TaskSubmissionService) private submissions: TaskSubmissionService,
  ) { }

  ngOnInit() {
    this.fillTabs();
  }

  fillTabs(): void {
    const newTabs = this.submissions.getLatestSubmissionsTimestamps(this.task);
    let transformedData = this.submissions.getLatestSubmissionsTimestamps(this.task).pipe(
      map(data => {
        // console.log(data.result, data.result.length);
        return data.result.map(timestamp => {
          // console.log(timestamp);
          return { timestamp: new Date(timestamp * 1000), content: '', timestampString: timestamp };
        });
      })
    );

    transformedData.subscribe(
      tabs => {
        this.tabs = tabs;
        if (!tabs.length) {
          this.tabs.push({timestamp: new Date(), content: 'There are no submissions for this task at the moment.' });
        }
        // console.log(tabs);
      },
      error => {
        console.log(error);
        /// TODO: alert service call
      }
    );
  }
}
