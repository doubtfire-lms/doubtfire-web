import {MultiSeries, TooltipService} from '@glitchtip/ng-charts';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {filter, map, take} from 'rxjs/operators';
import {TaskCodeStats, TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {TaskService} from 'src/app/api/services/task.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {
  countStudentsFromSnapshot,
  displayWeekNumber,
  dropLeadingEmptySnapshots,
  formatSnapshotLabel,
  getTaskStats,
  shouldIncludeSnapshot,
  statusMapping,
} from '../chart-data-helpers';

export interface SnapshotWeekSegment {
  key: string;
  label: string;
  shortLabel: string;
  text: string;
  tooltip: string;
  startIndex: number;
  endIndex: number;
  startFraction: number;
  endFraction: number;
  leftStyle: string;
  widthStyle: string;
}

// The Material slider centres its thumb between this inset and `width - inset`.
const TICK_MARK_OFFSET = 3;
const FULL_LABEL_MIN_WIDTH = 56;
const SHORT_LABEL_MIN_WIDTH = 28;
// Beyond this many snapshots the slider's tick marks merge into a solid line, so they are hidden.
const MAX_TICK_MARKS = 40;
// Week 0 starts mid-week and the current week is only days old, so both are widened to stay readable.
const MIN_EDGE_SEGMENT_WIDTH = 60;

const offsetStyle = (fraction: number) =>
  `calc(${TICK_MARK_OFFSET}px + ${fraction} * (100% - ${TICK_MARK_OFFSET * 2}px))`;
const spanStyle = (fraction: number) => `calc(${fraction} * (100% - ${TICK_MARK_OFFSET * 2}px))`;

@Component({
  selector: 'f-normalised-task-status-chart',
  templateUrl: './normalised-task-status-chart.component.html',
  styleUrl: './normalised-task-status-chart.component.scss',
  standalone: false,
})
export class NormalisedTaskStatusChartComponent implements OnInit, OnDestroy {
  @Input() unit: Unit;

  data: MultiSeries = [];
  weeklyData: MultiSeries = [];
  hasChartData: boolean = false;
  sliderSelect: number = 0;
  snapshots: TaskCompletionSnapshot[] = [];
  campuses: string[] = [];
  weekSegments: SnapshotWeekSegment[] = [];

  private trackWidth: number = 0;
  private resizeObserver?: ResizeObserver;

  @ViewChild('weekTrack')
  set weekTrack(ref: ElementRef<HTMLElement> | undefined) {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    if (!ref) {
      return;
    }

    // observe() fires the first measurement; assigning here would mutate a value already read.
    this.resizeObserver = new ResizeObserver((entries) => {
      this.ngZone.run(() => {
        this.trackWidth = entries[0]?.contentRect.width ?? 0;
        this.updateWeekBand();
        this.changeDetectorRef.markForCheck();
      });
    });
    this.resizeObserver.observe(ref.nativeElement);
  }

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
    return formatSnapshotLabel(this.unit, this.snapshots[0]?.snapshot_date);
  }

  get lastSnapshotDate(): string {
    return formatSnapshotLabel(this.unit, this.snapshots[this.snapshots.length - 1]?.snapshot_date);
  }

  get showTickMarks(): boolean {
    return this.snapshots.length <= MAX_TICK_MARKS;
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
    private ngZone: NgZone,
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

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
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

  private updateWeekBand(): void {
    if (this.trackWidth === 0) {
      this.weekSegments.forEach((segment) => (segment.text = segment.label));
      return;
    }

    const usableWidth = Math.max(this.trackWidth - TICK_MARK_OFFSET * 2, 0);
    const widths = this.weekSegments.map(
      (segment) => (segment.endFraction - segment.startFraction) * usableWidth,
    );
    // Format comes from the natural widths, so widening an edge week cannot flip the whole band.
    const sorted = [...widths].sort((left, right) => left - right);
    const medianWidth = sorted[Math.floor(sorted.length / 2)];
    const narrowestSegment = Math.min(...sorted.filter((width) => width >= medianWidth / 2));

    const useFullLabels = narrowestSegment >= FULL_LABEL_MIN_WIDTH;
    const requiredWidth = useFullLabels ? FULL_LABEL_MIN_WIDTH : SHORT_LABEL_MIN_WIDTH;

    this.widenEdgeSegments(widths, usableWidth, requiredWidth);

    this.weekSegments.forEach((segment, index) => {
      segment.text =
        widths[index] < requiredWidth ? '' : useFullLabels ? segment.label : segment.shortLabel;
    });
  }

  private widenEdgeSegments(widths: number[], usableWidth: number, requiredWidth: number): void {
    this.weekSegments.forEach((segment) => {
      segment.leftStyle = offsetStyle(segment.startFraction);
      segment.widthStyle = spanStyle(segment.endFraction - segment.startFraction);
    });

    const lastIndex = this.weekSegments.length - 1;
    if (lastIndex < 0) {
      return;
    }

    const minimum = Math.min(MIN_EDGE_SEGMENT_WIDTH, usableWidth);
    const widenLeading = widths[0] < minimum;
    const widenTrailing = lastIndex > 0 && widths[lastIndex] < minimum;
    if (!widenLeading && !widenTrailing) {
      return;
    }

    const boundaries = this.weekSegments.map(
      (segment) => TICK_MARK_OFFSET + segment.startFraction * usableWidth,
    );
    boundaries.push(TICK_MARK_OFFSET + usableWidth);

    const spareOf = (index: number) => Math.max((widths[index] ?? 0) - requiredWidth, 0);

    if (widenLeading) {
      boundaries[1] = boundaries[0] + Math.min(minimum, widths[0] + spareOf(1));
    }
    if (widenTrailing) {
      boundaries[lastIndex] =
        boundaries[lastIndex + 1] - Math.min(minimum, widths[lastIndex] + spareOf(lastIndex - 1));
    }

    for (let index = 1; index <= lastIndex; index += 1) {
      boundaries[index] = Math.min(
        Math.max(boundaries[index], boundaries[index - 1]),
        boundaries[lastIndex + 1],
      );
    }

    this.weekSegments.forEach((segment, index) => {
      const width = boundaries[index + 1] - boundaries[index];
      segment.leftStyle = `${boundaries[index]}px`;
      segment.widthStyle = `${width}px`;
      widths[index] = width;
    });
  }

  isActiveWeek(segment: SnapshotWeekSegment): boolean {
    return this.sliderSelect >= segment.startIndex && this.sliderSelect <= segment.endIndex;
  }

  selectWeek(segment: SnapshotWeekSegment): void {
    this.onSnapshotSliderChange(segment.endIndex);
  }

  private buildWeekSegments(): void {
    const total = this.snapshots.length;
    if (total === 0) {
      this.weekSegments = [];
      return;
    }

    const groups: {weekNumber: number | null; startIndex: number; endIndex: number}[] = [];
    this.snapshots.forEach((snapshot, index) => {
      const weekNumber = displayWeekNumber(this.unit, new Date(snapshot.snapshot_date));
      const current = groups[groups.length - 1];

      // Nulls merge too, so a unit with no start date collapses to one suppressed segment.
      if (current && current.weekNumber === weekNumber) {
        current.endIndex = index;
      } else {
        groups.push({weekNumber, startIndex: index, endIndex: index});
      }
    });

    const denominator = Math.max(total - 1, 1);

    this.weekSegments = groups.map((group) => {
      const startFraction = group.startIndex === 0 ? 0 : (group.startIndex - 0.5) / denominator;
      const endFraction = group.endIndex === total - 1 ? 1 : (group.endIndex + 0.5) / denominator;
      const label = group.weekNumber === null ? 'Unscheduled' : `Week ${group.weekNumber}`;
      const shortLabel = group.weekNumber === null ? '–' : `W${group.weekNumber}`;
      const startDate = formatSnapshotLabel(
        this.unit,
        this.snapshots[group.startIndex]?.snapshot_date,
      );
      const endDate = formatSnapshotLabel(this.unit, this.snapshots[group.endIndex]?.snapshot_date);
      const range = startDate === endDate ? startDate : `${startDate} – ${endDate}`;

      return {
        key: `${label}-${group.startIndex}`,
        label,
        shortLabel,
        text: label,
        tooltip: `${label} · ${range}`,
        startIndex: group.startIndex,
        endIndex: group.endIndex,
        startFraction,
        endFraction,
        leftStyle: offsetStyle(startFraction),
        widthStyle: spanStyle(endFraction - startFraction),
      };
    });

    this.updateWeekBand();
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
        this.snapshots = dropLeadingEmptySnapshots([...this.snapshots].reverse());
        this.sliderSelect = Math.max(this.snapshots.length - 1, 0);
        this.buildWeekSegments();
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
