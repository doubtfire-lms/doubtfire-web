import {MultiSeries, TooltipService} from '@glitchtip/ng-charts';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {filter, map, take} from 'rxjs/operators';
import {
  CampusStats,
  TaskCodeStats,
  TaskCompletionSnapshot,
  TutorialStats,
} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {TaskService} from 'src/app/api/services/task.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {
  countStudentsFromSnapshot,
  formatSnapshotLabel,
  getTaskStats,
  shouldIncludeSnapshot,
  statusMapping,
} from '../chart-data-helpers';

@Component({
  selector: 'f-normalised-task-status-chart',
  templateUrl: './normalised-task-status-chart.component.html',
  styleUrl: './normalised-task-status-chart.component.scss',
  standalone: false,
})

export class NormalisedTaskStatusChartComponent implements OnInit {
  @Input() unit: Unit;

  data: MultiSeries = [];
  weeklyData: MultiSeries = [];
  hasChartData: boolean = false;
  sliderSelect: number = 0;
  snapshots: TaskCompletionSnapshot[] = [];
  campuses: string[] = [];

  // options
  normalisedCompletionSnapshotXLabel: string = 'Task';
  normalisedCompletionSnapshotYLabel: string = 'Percentage of Students';

  colorScheme = {
    domain: [''],
  };

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

  private autoCaptureAttempted: boolean = false;

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

  campusFilter: string = 'all';

  ngOnInit(): void {
    this.chartToolTipService.injectionService.setRootViewContainer(this.viewContainerRef);

    this.colorScheme.domain = statusMapping.map(
      (labels) => this.taskService.statusColors.get(labels) || '#000000',
    );
    this.loadRecentSnapshot();
  }

  refreshData() {
    const selectedSnapshot = this.selectedSnapshot;

    if (!selectedSnapshot) {
      this.data = [];
      this.weeklyData = [];
      this.campuses = [];
      this.hasChartData = false;
      return;
    }

    this.campuses = Object.keys(selectedSnapshot.stats);

    this.data = this.buildChartData(getTaskStats(selectedSnapshot, this.campusFilter));
    this.weeklyData = this.buildWeeklyChartData(this.snapshots);
    this.hasChartData = this.data.length > 0;
  }

  onSnapshotSliderChange(value: number): void {
    this.sliderSelect = Math.min(Math.max(Math.round(Number(value)), 0), this.sliderMax);
    this.refreshData();
  }

  private buildChartData(taskStats: TaskCodeStats): MultiSeries {
    const taskSeqByCode = new Map(
      this.unit.taskDefinitions.map((taskDefinition) => [
        taskDefinition.abbreviation,
        taskDefinition.seq,
      ]),
    );
    return Object.entries(taskStats)
      .sort(([taskCodeA], [taskCodeB]) => {
        const seqA = taskSeqByCode.get(taskCodeA) ?? Number.MAX_SAFE_INTEGER;
        const seqB = taskSeqByCode.get(taskCodeB) ?? Number.MAX_SAFE_INTEGER;
        return seqA - seqB;
      })
      .map(([taskDef, counts]) => ({
        name: taskDef,
        series: statusMapping.map((status) => ({
          name: this.taskService.statusLabels.get(status) || status,
          value: counts[status] || 0,
        })),
      }));
  }

  private buildWeeklyChartData(snapshots: TaskCompletionSnapshot[]): MultiSeries {
    const lastSnapshotByWeek: Map<string, TaskCompletionSnapshot> = new Map();

    snapshots.forEach((snapshot) => {
      const weekNumber = formatSnapshotLabel(this.unit, snapshot.snapshot_date, 'short');
      if (weekNumber) {
        lastSnapshotByWeek.set(weekNumber, snapshot);
      }
    });

    const snapshotsByWeek = [...lastSnapshotByWeek.values()];
    return statusMapping.map((status) => ({
      name: this.taskService.statusLabels.get(status) || status,
      series: snapshotsByWeek.map((snapshot) => {
        const taskStats = getTaskStats(snapshot, this.campusFilter);
        const value = Object.values(taskStats).reduce(
          (total, taskCounts) => total + (taskCounts[status] || 0),
          0,
        );

        return {
          name: formatSnapshotLabel(this.unit, snapshot.snapshot_date, 'short'),
          value,
        };
      }),
    }));
  }

  onSelect(): void {}

  loadRecentSnapshot(): void {
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
              this.loadRecentSnapshot();
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
