import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-unit-analytics',
  templateUrl: 'unit-analytics-route.component.html',
  styleUrls: ['unit-analytics-route.component.scss'],
})
export class UnitAnalyticsComponent implements OnInit {
  @Input() unit: Unit;

  tutorTimeSummaryStartDate: Date;
  tutorTimeSummaryEndDate: Date;

  constructor(
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private alertsService: AlertService,
    private fileDownloaderService: FileDownloaderService,
  ) {}

  ngOnInit(): void {
    this.tutorTimeSummaryEndDate = new Date();
    this.tutorTimeSummaryStartDate = new Date(
      this.tutorTimeSummaryEndDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
  }

  public getTaskCompletionCsv() {
    this.downloadCsv(
      this.unit.downloadTaskCompletionCsv(),
      'Task Completion Stats CSV',
      `${this.unit.code}-task-completion-stats.csv`,
    );
  }

  public getTutorAssessmentCsv() {
    this.downloadCsv(
      this.unit.downloadTutorAssessmentCsv(),
      'Tutor Assessment Stats CSV',
      `${this.unit.code}-tutor-assessment-stats.csv`,
    );
  }

  public getTasksAwaitingFeedbackCsv() {
    this.downloadCsv(
      this.unit.downloadTasksAwaitingFeedbackCsv(),
      'Tasks Awaiting Feedback CSV',
      `${this.unit.code}-tasks-awaiting-feedback.csv`,
    );
  }

  public getTaskAssessmentCountCsv() {
    this.downloadCsv(
      this.unit.downloadTaskAssessmentCountsCsv(),
      'Task Assessment Counts CSV',
      `${this.unit.code}-task-assessment-counts.csv`,
    );
  }

  public getTutorTimesSummary() {
    const start = this.tutorTimeSummaryStartDate.toISOString().split('T')[0];
    const end = this.tutorTimeSummaryEndDate.toISOString().split('T')[0];

    this.downloadCsv(
      this.unit.downloadTutorTimesSummaryCsv(
        this.tutorTimeSummaryStartDate,
        this.tutorTimeSummaryEndDate,
      ),
      'Tutor Times Summary CSV',
      `${this.unit.code}-tutor-times-summary-${start}-to-${end}.csv`,
    );
  }

  private downloadCsv(newJob: Observable<SidekiqJob>, title: string, filename: string) {
    newJob.subscribe({
      next: (job) => {
        if (!job || !job.id) {
          return this.alertsService.error(`Failed to download ${title}`, 6000);
        }
        this.sidekiqProgressModalService.show(`Downloading ${title}`, job.id).subscribe((job) => {
          const blob = new Blob([job.result], {type: 'text/csv'});
          const url = URL.createObjectURL(blob);

          this.fileDownloaderService.downloadBlobToFile(url, filename);
        });
      },
      error: (_error) => {
        this.alertsService.error(`Could not download ${title}`, 6000);
      },
    });
  }
}
