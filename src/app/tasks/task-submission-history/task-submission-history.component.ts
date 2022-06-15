import { Component, OnInit, Inject, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';
import { map } from 'rxjs/operators';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { Subject } from 'rxjs';
import { OverseerAssessmentService, Task } from 'src/app/api/models/doubtfire-model';
import { OverseerAssessment } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'task-submission-history',
  templateUrl: './task-submission-history.component.html',
  styleUrls: ['./task-submission-history.component.scss'],
})
export class TaskSubmissionHistoryComponent implements OnInit {
  @Input() task: Task;
  @Output() hasNoData = new EventEmitter<boolean>();
  tabs: OverseerAssessment[];
  // timestamps: string[];
  selectedTab: OverseerAssessment = new OverseerAssessment();
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
          this.tabs = [new OverseerAssessment()];
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

  triggerOverseer(tab: OverseerAssessment) {
    this.overseerAssessmentService.triggerOverseer(tab).subscribe(
      (response: OverseerAssessment) => { this.alerts.add('success', 'Overseer assessment will be run again.', 2000); },
      (response: any) => { this.alerts.add('danger', 'Error requesting overseer assessment.', 6000); }
    );
  }

  openSubmission(tab: OverseerAssessment) {
    this.selectedTab = tab;
    // this.selectedTab.timestamp = tab.timestamp;
    // this.selectedTab.timestampString = tab.timestampString;
    // this.selectedTab.taskStatus = tab.taskStatus;
    // this.selectedTab.submissionStatus = tab.submissionStatus;

    this.submissions.getSubmissionByTimestamp(this.task, tab.timestampString)
      .subscribe(
        sub => {
          this.selectedTab.content = sub;
          this.hasNoData.emit(false);
        },
        error => {
          // TODO: make error handling more readable...
          this.selectedTab.content = [{label: 'Error', result: error?.error?.error}];
          this.hasNoData.emit(true);
        }
      );
  }
}
