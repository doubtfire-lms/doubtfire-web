import { Component, OnInit, Inject, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';
import { map } from 'rxjs/operators';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { Subject } from 'rxjs';

export interface ISubmissionTab {
  id?: number;
  label?: string;
  timestamp: Date;
  timestampString?: string;
  content?: [{ label: string; result: string }];
  task?: any;
}

export class SubmissionTab implements ISubmissionTab {
  timestamp = new Date();
  id?: number;
  label?: string;
  timestampString?: string;
  content?: [{ label: string; result: string }];
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
  @Output() hasNoData = new EventEmitter<boolean>();
  tabs: SubmissionTab[];
  timestamps: string[];
  selectedTab: SubmissionTab = new SubmissionTab();
  noDataFlag: boolean = false;
  @Input() refreshTrigger: Subject<boolean>;

  constructor(
    @Inject(alertService) private alerts: any,
    @Inject(TaskSubmissionService) private submissions: TaskSubmissionService,
  ) { }

  ngOnInit() {
    this.fillTabs();

    this.refreshTrigger.subscribe( () => {
      this.fillTabs();
   });
  }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error, 6000);
  }

  fillTabs(): void {
    this.submissions.getLatestSubmissionsTimestamps(this.task);
    let transformedData = this.submissions.getLatestSubmissionsTimestamps(this.task).pipe(
      map(data => {
        return data.result.map((ts: number) => {
          return { timestamp: new Date(ts * 1000), content: '', timestampString: ts };
        });
      })
    );

    transformedData.subscribe(
      tabs => {
          if (tabs) {
            this.tabs = tabs;
            this.noDataFlag = false;
            this.hasNoData.emit(this.noDataFlag);
          }
        this.openSubmission(tabs[0]);
      },
      error => {
        if (error) {
          this.tabs = [{timestamp: new Date()}];
          this.selectedTab.content = [{label: 'No Data', result: 'There are no submissions for this task at the moment.' }];
          this.noDataFlag = true;
          this.hasNoData.emit(this.noDataFlag);
        }
      }
    );
  }

  openSubmission(tab: SubmissionTab) {
    this.selectedTab.timestamp = tab.timestamp;
    this.selectedTab.timestampString = tab.timestampString;
    this.submissions.getSubmissionByTimestamp(this.task, tab.timestampString)
      .subscribe(
        sub => {
          this.selectedTab.content = sub;
        },
        error => {
          this.selectedTab.content = [{label: 'Error', result: error }];
        }
      );
  }
}
