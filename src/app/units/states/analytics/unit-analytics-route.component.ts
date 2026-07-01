import {formatDate} from '@angular/common';
import {ChangeDetectionStrategy, Component, Inject, Input, LOCALE_ID, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, first, of} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-unit-analytics',
  templateUrl: 'unit-analytics-route.component.html',
  styleUrls: ['unit-analytics-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitAnalyticsComponent implements OnInit {
  @Input() public unit$: Observable<Unit>;

  public unit: Unit;

  constructor(
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private alertsService: AlertService,
    private fileDownloaderService: FileDownloaderService,
    private userService: UserService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private locale: string,
  ) {}

  ngOnInit(): void {
    this.unit$ = this.unit$ ?? of(this.route.parent.snapshot.data.unit);
    this.unit$?.pipe(first()).subscribe((unit) => {
      this.unit = unit;
    });
  }

  get role() {
    return this.unit?.staff.find((s) => s.user.id === this.userService.currentUser.id)?.role;
  }

  get isAdmin() {
    return this.userService.currentUser?.systemRole === 'Admin';
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

  public getOverflowTaskClaimsCsv() {
    const timestamp = formatDate(new Date(), 'd-MMMM-y-HHmm', this.locale).toLowerCase();

    this.downloadCsv(
      this.unit.downloadOverflowTaskClaimsCsv(),
      'Overflow Task Claims CSV',
      `${this.unit.code}-overflow-task-claims-${timestamp}.csv`,
    );
  }

  public downloadCsv(newJob: Observable<SidekiqJob>, title: string, filename: string) {
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
      error: (error) => {
        this.alertsService.error(`Could not download ${title}: ${error}`, 6000);
      },
    });
  }
}
