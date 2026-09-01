import {TooltipService} from '@glitchtip/ng-charts';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {filter, map, take} from 'rxjs/operators';
import {TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {TaskService} from 'src/app/api/services/task.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {
  countStudentsFromSnapshot,
  formatSnapshotLabel,
  shouldIncludeSnapshot,
  statusMapping,
} from '../chart-data-helpers';

@Component({
  selector: 'f-task-status-summary-chart',
  templateUrl: './task-status-summary-chart.component.html',
  styleUrl: './task-status-summary-chart.component.scss',
  standalone: false,
})
export class TaskStatusSummaryChartComponent implements OnInit {
  @Input() unit: Unit;

  chartView: 'snapshots' | 'timeseries' = 'snapshots';
  hasChartData: boolean = false;
  sliderSelect: number = 0;
  snapshots: TaskCompletionSnapshot[] = [];
  campuses: string[] = [];

  colorScheme = {
    domain: [''],
  };

  constructor(
    private taskService: TaskService,
    private alertService: AlertService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private sidekiqJobService: SidekiqJobService,
    private chartToolTipService: TooltipService,
    private viewContainerRef: ViewContainerRef,
    private injectorObj: Injector,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }

  ngOnInit(): void {
    this.chartToolTipService.injectionService.setRootViewContainer(this.viewContainerRef);

    // this.colorScheme.domain = statusMapping.map(
    //   (labels) => this.taskService.statusColors.get(labels) || '#000000',
    // );
    this.colorScheme.domain = statusMapping.map((status) =>
      status === 'not_started'
        ? 'transparent'
        : this.taskService.statusColors.get(status) || '#000000',
    );
    this.loadSnapshots();
  }

  private autoCaptureAttempted: boolean = false;

  campusFilter: string = 'all';

  get sliderMax(): number {
    return Math.max(this.snapshots.length - 1, 0);
  }

  get selectedSnapshot(): TaskCompletionSnapshot | undefined {
    return this.snapshots[this.sliderSelect];
  }

  get selectedSnapshotDate(): string {
    return formatSnapshotLabel(this.unit, this.selectedSnapshot?.snapshot_date, 'long');
  }

  get firstSnapshotDate(): string {
    return formatSnapshotLabel(this.unit, this.snapshots[0]?.snapshot_date, 'long');
  }

  get lastSnapshotDate(): string {
    return formatSnapshotLabel(
      this.unit,
      this.snapshots[this.snapshots.length - 1]?.snapshot_date,
      'long',
    );
  }

  get snapshotDates(): string[] {
    return this.snapshots.map((snapshot) => formatSnapshotLabel(this.unit, snapshot.snapshot_date));
  }

  get snapshotWeeks(): string[] {
    const weeks = this.snapshots.map((snapshot) =>
      formatSnapshotLabel(this.unit, snapshot.snapshot_date, 'short'),
    );
    return weeks.reduce((acc: string[], week: string) => {
      if (!acc.includes(week)) {
        acc.push(week);
      } else {
        acc.push('');
      }
      return acc;
    }, []);
  }

  get snapshotStudentCount(): number {
    if (!this.selectedSnapshot) {
      return 0;
    }

    const snapshotData =
      this.campusFilter !== 'all' && this.selectedSnapshot.stats[this.campusFilter]
        ? {[this.campusFilter]: this.selectedSnapshot.stats[this.campusFilter]}
        : this.selectedSnapshot.stats;

    return countStudentsFromSnapshot(snapshotData);
  }

  // Format the snapshot date for display on the slider tooltip
  formatSnapshotDate = (value: number): string => {
    return formatSnapshotLabel(
      this.unit,
      this.snapshots[Math.min(Math.max(Math.round(Number(value)), 0), this.sliderMax)]
        ?.snapshot_date,
    );
  };

  refreshData() {
    const selectedSnapshot = this.selectedSnapshot;

    if (!selectedSnapshot) {
      this.campuses = [];
      this.hasChartData = false;
      return;
    }

    this.campuses = Object.keys(selectedSnapshot.stats);
    this.hasChartData = true;
  }

  onSnapshotSliderChange(value: number): void {
    this.sliderSelect = Math.min(Math.max(Math.round(Number(value)), 0), this.sliderMax);
    this.refreshData();
  }

  loadSnapshots(): void {
    if (!this.unit) {
      return;
    }

    this.unit.getTaskCompletionSnapshots().subscribe({
      next: (data) => {
        this.snapshots = [...(data as TaskCompletionSnapshot[])]
          .sort((left, right) => Number(left.snapshot_timestamp) - Number(right.snapshot_timestamp))
          .reduceRight((acc, snapshot) => {
            if (!acc.find((s) => s.snapshot_date === snapshot.snapshot_date)) {
              acc.push(snapshot);
            }
            return acc;
          }, [] as TaskCompletionSnapshot[])
          .filter((snapshot) => shouldIncludeSnapshot(this.unit, snapshot));
        this.snapshots = [...this.snapshots].reverse();
        this.sliderSelect = Math.max(this.snapshots.length - 1, 0);
        this.refreshData();
        this.changeDetectorRef.detectChanges();

        if (this.snapshots.length === 0 && !this.autoCaptureAttempted) {
          this.autoCaptureAttempted = true;
          this.captureNow();
        }
      },
      error: (error) => {
        console.log('Snapshot load failed', error);
        const errorMessage = error
          ? error.message || error.toString()
          : 'Failed to load task completion snapshot.';
        this.alertService.error(errorMessage, 6000);
      },
    });
  }

  captureNow(): void {
    this.unit.captureTaskCompletionSnapshot().subscribe({
      next: (job) => {
        if (!job?.id) {
          this.alertService.error('Failed to capture task completion snapshot.', 6000);
          return;
        }

        this.sidekiqProgressModalService.show(
          `Capturing task completion snapshot for ${this.unit.code}`,
          job.id,
        );

        this.sidekiqJobService.sidekiqJobsSubject
          .pipe(
            map((jobs) => jobs.find((entry) => entry.job?.id === job.id)?.job),
            filter(
              (trackedJob): trackedJob is SidekiqJob =>
                !!trackedJob &&
                ['complete', 'failed', 'stopped', 'interrupted'].includes(trackedJob.status),
            ),
            take(1),
          )
          .subscribe((trackedJob) => {
            if (trackedJob.status === 'complete') {
              this.loadSnapshots();
            }
          });
      },
      error: (error) => {
        console.log('Snapshot capture failed', error);
        const errorMessage = error
          ? error.message || error.toString()
          : 'Failed to capture task completion snapshot.';
        this.alertService.error(errorMessage, 6000);
      },
    });
  }
}
