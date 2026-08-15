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
  TaskCodeStats,
  TaskCompletionSnapshot,
  TaskStatusEnum,
  TutorialStats,
} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {TaskService} from 'src/app/api/services/task.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-summary-task-status-chart',
  templateUrl: './summary-task-status-chart.component.html',
  styleUrl: './summary-task-status-chart.component.scss',
  standalone: false,
})
export class SummaryTaskStatusChartComponent implements OnInit {
  @Input() unit: Unit;

  data: MultiSeries = [];
  hasChartData: boolean = false;
  sliderSelect: number = 0;
  snapshots: TaskCompletionSnapshot[] = [];
  campuses: string[] = [];

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Task';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Status';
  animations: boolean = true;

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
    return this.formatSnapshotLabel(this.selectedSnapshot?.snapshot_date, 'long');
  }

  get firstSnapshotDate(): string {
    return this.formatSnapshotLabel(this.snapshots[0]?.snapshot_date);
  }

  get lastSnapshotDate(): string {
    return this.formatSnapshotLabel(this.snapshots[this.snapshots.length - 1]?.snapshot_date);
  }

  get snapshotDates(): string[] {
    return this.snapshots.map((snapshot) => this.formatSnapshotLabel(snapshot.snapshot_date));
  }

  get snapshotWeeks(): string[] {
    const weeks = this.snapshots.map((snapshot) =>
      this.formatSnapshotLabel(snapshot.snapshot_date, 'short'),
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

    const studentCount = Object.values(snapshotData).reduce((acc, campusData) => {
      const campusStudentCount = Object.values(campusData).reduce((campusAcc, tutorialData) => {
        const firstTaskStats = Object.values(tutorialData)[0];
        const tutorialStudentCount = firstTaskStats
          ? Object.values(firstTaskStats).reduce((acc, count) => acc + count, 0)
          : 0;
        return campusAcc + tutorialStudentCount;
      }, 0);
      return acc + campusStudentCount;
    }, 0);

    return studentCount;
  }

  formatSnapshotDate = (value: number): string => {
    return this.formatSnapshotLabel(
      this.snapshots[Math.min(Math.max(Math.round(Number(value)), 0), this.sliderMax)]
        ?.snapshot_date,
    );
  };

  private formatSnapshotLabel(snapshotDate?: string, format?: string): string {
    if (!snapshotDate) {
      return '';
    }

    const date = new Date(snapshotDate);
    if (Number.isNaN(date.valueOf())) {
      return snapshotDate;
    }

    const weekNumber = this.unit?.weekNumber(date);

    if (!format) {
      const dayName = new Intl.DateTimeFormat(undefined, {weekday: 'short'}).format(date);
      return weekNumber ? `${dayName} W${weekNumber}` : `${dayName} ${date.toLocaleDateString()}`;
    } else if (format === 'short') {
      return `W${weekNumber}`;
    } else if (format === 'long') {
      return `${date.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })} | Week ${weekNumber}`;
    }
  }

  private autoCaptureAttempted: boolean = false;

  private readonly statusMapping: TaskStatusEnum[] = [
    'complete',
    'assess_in_portfolio',
    'discuss',
    'demonstrate',
    'redo',
    'fix_and_resubmit',
    'ready_for_feedback',
    'working_on_it',
    'need_help',
    'attention_required',
    'time_exceeded',
    'feedback_exceeded',
    'fail',
    'not_started',
  ];

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

    this.colorScheme.domain = this.statusMapping.map(
      (labels) => this.taskService.statusColors.get(labels) || '#000000',
    );
    this.loadRecentSnapshot();
  }

  refreshData() {
    const selectedSnapshot = this.selectedSnapshot;

    if (!selectedSnapshot) {
      this.data = [];
      this.campuses = [];
      this.hasChartData = false;
      return;
    }

    this.campuses = Object.keys(selectedSnapshot.stats);

    this.data =
      this.campusFilter !== 'all' && selectedSnapshot.stats[this.campusFilter]
        ? this.buildChartData(this.aggregateCampusData(selectedSnapshot.stats[this.campusFilter]))
        : this.buildChartData(this.aggregateAllCampuses(selectedSnapshot.stats));
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
        series: this.statusMapping.map((status) => ({
          name: this.taskService.statusLabels.get(status) || status,
          value: counts[status] || 0,
        })),
      }));
  }

  private mergeTaskCounts(target: TaskCodeStats, source: TaskCodeStats): void {
    Object.entries(source).forEach(([taskDef, counts]) => {
      target[taskDef] = target[taskDef] || {};
      Object.entries(counts).forEach(([status, value]) => {
        target[taskDef][status] = (target[taskDef][status] || 0) + value;
      });
    });
  }

  private aggregateCampusData(campusData: TutorialStats): TaskCodeStats {
    return Object.values(campusData).reduce((acc, tutorialData) => {
      this.mergeTaskCounts(acc, tutorialData);
      return acc;
    }, {} as TaskCodeStats);
  }

  private aggregateAllCampuses(snapshotStats: TaskCompletionSnapshot['stats']): TaskCodeStats {
    return Object.values(snapshotStats).reduce((acc, campusData) => {
      this.mergeTaskCounts(acc, this.aggregateCampusData(campusData));
      return acc;
    }, {} as TaskCodeStats);
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
          }, [] as TaskCompletionSnapshot[]);
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
