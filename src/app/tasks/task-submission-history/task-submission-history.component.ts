import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SubmissionHistory} from 'src/app/api/models/submission-history';
import {Task} from 'src/app/api/models/task';
import {SubmissionHistoryService} from 'src/app/api/services/submission-history.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {TaskAssessmentModalService} from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {SubmissionFilesModalComponent} from 'src/app/projects/states/dashboard/directives/task-dashboard/directives/task-overseer-report/submission-files-modal/submission-files-modal.component';

@Component({
  selector: 'f-task-submission-history',
  templateUrl: './task-submission-history.component.html',
  styleUrls: ['./task-submission-history.component.scss'],
  standalone: false,
})
export class TaskSubmissionHistoryComponent implements OnInit {
  @Input() task: Task;

  public histories: SubmissionHistory[] = [];
  public comparisonSourceId: number | null = null;
  public loading = false;

  constructor(
    private historiesService: SubmissionHistoryService,
    private alerts: AlertService,
    private dialog: MatDialog,
    private fileDownloader: FileDownloaderService,
    private taskAssessmentModal: TaskAssessmentModalService,
  ) {}

  ngOnInit(): void {
    this.loadHistories();
  }

  public loadHistories(): void {
    this.loading = true;
    this.historiesService.queryForTask(this.task).subscribe({
      next: (histories) => {
        this.histories = histories;
        this.loading = false;
        if (!histories.some((history) => history.id === this.comparisonSourceId)) {
          this.comparisonSourceId = null;
        }
      },
      error: (error) => {
        this.loading = false;
        this.alerts.error(`Failed to load submission history: ${error}`, 6000);
      },
    });
  }

  public view(history: SubmissionHistory): void {
    this.openDialog(history);
  }

  public selectForComparison(history: SubmissionHistory): void {
    this.comparisonSourceId = history.id;
  }

  public compare(history: SubmissionHistory): void {
    const selected = this.histories.find((item) => item.id === this.comparisonSourceId);
    if (selected && selected.id !== history.id) {
      this.openDialog(history, selected);
    }
  }

  public download(history: SubmissionHistory): void {
    this.fileDownloader.downloadFile(
      history.submissionFilesUrl(),
      `submission-${history.timestampString}.zip`,
    );
  }

  public viewOverseerReport(history: SubmissionHistory): void {
    if (history.overseerAssessmentId) {
      this.taskAssessmentModal.show(this.task, history.overseerAssessmentId);
    }
  }

  private openDialog(history: SubmissionHistory, comparedWith?: SubmissionHistory): void {
    const historyIndex = this.histories.findIndex((item) => item.id === history.id);
    const comparedIndex = comparedWith
      ? this.histories.findIndex((item) => item.id === comparedWith.id)
      : -1;

    this.dialog.open(SubmissionFilesModalComponent, {
      data: {
        assessment: history,
        assessmentNumber: this.histories.length - historyIndex,
        assessmentIsMostRecent: historyIndex === 0,
        comparedWith,
        comparedWithNumber: comparedIndex >= 0 ? this.histories.length - comparedIndex : undefined,
        comparedWithIsMostRecent: comparedIndex === 0,
      },
      maxWidth: '95vw',
      width: '100%',
      height: '90vh',
      panelClass: 'submission-files-dialog',
    });
  }
}
