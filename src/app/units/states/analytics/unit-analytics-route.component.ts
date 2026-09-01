import {formatDate} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription, first, of} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

type AnalyticsTabKey =
  'task-completion' | 'target-grades' | 'tasks-awaiting-feedback' | 'resubmissions' | 'tutor-times' | 'download-data';

interface AnalyticsTab {
  label: string;
  routeSegment: AnalyticsTabKey;
}

@Component({
  selector: 'f-unit-analytics',
  templateUrl: 'unit-analytics-route.component.html',
  styleUrls: ['unit-analytics-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitAnalyticsComponent implements OnInit, OnDestroy {
  @Input() public unit$: Observable<Unit>;

  public unit: Unit;

  public readonly tabs: AnalyticsTab[] = [
    {label: 'Task Completion', routeSegment: 'task-completion'},
    // {label: 'Target Grades', routeSegment: 'target-grades'},
    // {label: 'Tasks Awaiting Feedback', routeSegment: 'tasks-awaiting-feedback'},
    // {label: 'Resubmissions', routeSegment: 'resubmissions'},
    {label: 'Tutor Times', routeSegment: 'tutor-times'},
    {label: 'Download Data', routeSegment: 'download-data'},
  ];

  public currentTab: AnalyticsTab = this.tabs[0];

  private subscriptions: Subscription[] = [];

  constructor(
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private alertsService: AlertService,
    private fileDownloaderService: FileDownloaderService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string,
  ) {}

  ngOnInit(): void {
    this.updateCurrentTabFromState(this.route.snapshot.paramMap.get('tab'));

    this.unit$ = this.unit$ ?? of(this.route.parent.snapshot.data.unit);
    this.unit$?.pipe(first()).subscribe((unit) => {
      this.unit = unit;
    });

    this.subscriptions.push(
      this.route.paramMap.subscribe((params) => this.updateCurrentTabFromState(params.get('tab'))),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  get role() {
    return this.unit?.staff.find((s) => s.user.id === this.userService.currentUser.id)?.role;
  }

  get isAdmin() {
    return this.userService.currentUser?.systemRole === 'Admin';
  }

  public get currentIndex(): number {
    const index = this.tabs.findIndex((tab) => tab.routeSegment === this.currentTab.routeSegment);
    return index >= 0 ? index : 0;
  }

  public onTabChange(event: MatTabChangeEvent): void {
    const nextTab = this.tabs[event.index] ?? this.tabs[0];
    this.currentTab = nextTab;
    if (this.route.parent?.snapshot.data.unit) {
      this.router.navigate(
        [
          '/units',
          this.route.parent.snapshot.paramMap.get('unitId'),
          'analytics',
          nextTab.routeSegment,
        ],
        {replaceUrl: true},
      );
      return;
    }
  }

  private updateCurrentTabFromState(tabParam?: string | null): void {
    this.currentTab =
      this.tabs.find((tab) => tab.routeSegment === tabParam) ??
      this.tabs.find((tab) => tab.routeSegment === 'task-completion') ??
      this.tabs[0];
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
