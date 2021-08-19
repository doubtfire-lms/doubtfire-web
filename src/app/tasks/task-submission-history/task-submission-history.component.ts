import { Component, OnInit, Inject, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';
import { map } from 'rxjs/operators';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { Subject } from 'rxjs';
import { OverseerAssessmentService } from 'src/app/api/models/overseer-models/overseer-assessment/overseer-assessment.service';

export interface ISubmissionTab {
  id?: number;
  label?: string;
  timestamp: Date;
  timestampString?: string;
  content?: [{ label: string; result: string }];
  task?: any;
  taskStatus?: any;
  submissionStatus?: any;
  createdAt?: any;
  updatedAt?: any;
  taskId?: any;
}

export class SubmissionTab implements ISubmissionTab {
  timestamp = new Date();
  id?: number;
  label?: string;
  timestampString?: string;
  content?: [{ label: string; result: string }];
  task?: any;
  taskStatus?: any;
  submissionStatus?: any;
  createdAt?: any;
  updatedAt?: any;
  taskId?: any;
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
  @Input() refreshTrigger: Subject<boolean>;

  constructor(
    @Inject(alertService) private alerts: any,
    private submissions: TaskSubmissionService,
    private overseerAssessmentService: OverseerAssessmentService
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
    // this.submissions.getLatestSubmissionsTimestamps(this.task);
    // let transformedData = this.overseerAssessmentService.queryForTask(this.task).pipe(
    //   map(data => {
    //     return data.map((ts: any) => {
    //       let result = new SubmissionTab();
    //         timestamp: new Date(ts.submission_timestamp * 1000),
    //         content: '',
    //         timestampString: ts.submission_timestamp,
    //         taskStatus: ts.result_task_status,
    //         submissionStatus: ts.status,
    //         createdAt: ts.created_at,
    //         updatedAt: ts.updated_at,
    //         taskId: ts.task_id};
    //     });
    //   })
    // );

    this.overseerAssessmentService.queryForTask(this.task).subscribe(
      tabs => {
        if (tabs.length === 0) {
          this.tabs = [{timestamp: new Date()}];
          this.selectedTab.content = [{label: 'No Data', result: 'There are no submissions for this task at the moment.' }];
        } else {
          this.tabs = tabs;
        }
        // if (this.selectedTab.timestampString) {
        //   this.openSubmission(tabs.filter(x => x.timestampString === this.selectedTab.timestampString)[0]);
        // } else {
        //   this.openSubmission(tabs[0]);
        // }
      },
      error => {
        this.handleError(error);
      }
    );
  }

  openSubmission(tab: SubmissionTab) {
    this.selectedTab.timestamp = tab.timestamp;
    this.selectedTab.timestampString = tab.timestampString;
    this.selectedTab.taskStatus = tab.taskStatus;
    this.selectedTab.submissionStatus = tab.submissionStatus;

    this.submissions.getSubmissionByTimestamp(this.task, tab.timestampString)
      .subscribe(
        sub => {
          this.selectedTab.content = sub;
          this.hasNoData.emit(false);
        },
        error => {
          this.selectedTab.content = [{label: 'Error', result: error }];
          this.hasNoData.emit(true);
        }
      );
  }
}
