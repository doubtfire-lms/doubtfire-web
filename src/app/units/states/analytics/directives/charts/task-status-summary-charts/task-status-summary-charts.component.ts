import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {filter, map, take} from 'rxjs/operators';
import {addDays, startOfDay} from 'src/app/api/models/calendar-day';
import {
  CampusStats,
  TaskCodeStats,
  TaskCompletionSnapshot,
} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {TeachingPeriodBreak} from 'src/app/api/models/teaching-period';
import {Unit} from 'src/app/api/models/unit';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {
  displayWeekNumber,
  dropLeadingEmptySnapshots,
  formatSnapshotLabel,
  shouldIncludeSnapshot,
} from '../chart-data-helpers';

export interface SnapshotWeekSegment {
  key: string;
  isBreak: boolean;
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

export interface SnapshotBreakSegment {
  key: string;
  label: string;
  text: string;
  tooltip: string;
  lane: number;
  pausesWeekCount: boolean;
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
const DAYS_PER_WEEK = 7;
// A one week break is only a few dozen pixels wide, so its name is truncated rather
// than hidden. Below this even an ellipsis is noise, and the tooltip has to carry it.
const BREAK_LABEL_MIN_WIDTH = 24;
const BREAK_LANE_HEIGHT = 24;

const offsetStyle = (fraction: number) =>
  `calc(${TICK_MARK_OFFSET}px + ${fraction} * (100% - ${TICK_MARK_OFFSET * 2}px))`;
const spanStyle = (fraction: number) => `calc(${fraction} * (100% - ${TICK_MARK_OFFSET * 2}px))`;

@Component({
  selector: 'f-task-status-summary-charts',
  styleUrl: './task-status-summary-charts.component.scss',
  templateUrl: './task-status-summary-charts.component.html',
  standalone: false,
})
export class TaskStatusSummaryChartsComponent implements OnInit, OnDestroy {
  @Input() unit: Unit;

  chartView: 'snapshots' | 'timeseries' = 'snapshots';

  sliderSelect: number = 0;
  snapshots: TaskCompletionSnapshot[] = [];
  campuses: string[] = [];
  weekSegments: SnapshotWeekSegment[] = [];
  breakSegments: SnapshotBreakSegment[] = [];
  breakLaneCount: number = 0;

  private weekBoundaries: number[] = [];
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

  get sliderMax(): number {
    return Math.max(this.snapshots.length - 1, 0);
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
    private readonly alertService: AlertService,
    private readonly sidekiqProgressModalService: SidekiqProgressModalService,
    private readonly sidekiqJobService: SidekiqJobService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
  ) {}

  campusFilter: string = 'all';

  ngOnInit(): void {
    this.loadRecentSnapshot();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  onSnapshotSliderChange(value: number): void {
    this.sliderSelect = Math.min(Math.max(Math.round(Number(value)), 0), this.sliderMax);
    this.campuses = Object.keys(this.snapshots[this.sliderSelect]?.stats ?? {});
  }

  private updateWeekBand(): void {
    if (this.trackWidth === 0) {
      this.weekSegments.forEach((segment) => (segment.text = segment.label));
      this.breakSegments.forEach((segment) => (segment.text = segment.label));
      return;
    }

    const usableWidth = Math.max(this.trackWidth - TICK_MARK_OFFSET * 2, 0);
    const widths = this.weekSegments.map(
      (segment) => (segment.endFraction - segment.startFraction) * usableWidth,
    );

    // Every segment is sized by the days it covers, so a full week is always the same
    // width as any other. Label format comes from the narrowest of them.
    const sorted = [...widths].sort((left, right) => left - right);
    const medianWidth = sorted[Math.floor(sorted.length / 2)];
    const narrowestSegment = Math.min(...sorted.filter((width) => width >= medianWidth / 2));

    const useFullLabels = narrowestSegment >= FULL_LABEL_MIN_WIDTH;
    const requiredWidth = useFullLabels ? FULL_LABEL_MIN_WIDTH : SHORT_LABEL_MIN_WIDTH;

    this.weekBoundaries = this.weekSegments.map(
      (segment) => TICK_MARK_OFFSET + segment.startFraction * usableWidth,
    );
    this.weekBoundaries.push(TICK_MARK_OFFSET + usableWidth);

    this.weekSegments.forEach((segment, index) => {
      segment.leftStyle = offsetStyle(segment.startFraction);
      segment.widthStyle = spanStyle(segment.endFraction - segment.startFraction);
      let text = '';
      if (widths[index] >= requiredWidth) {
        text = useFullLabels ? segment.label : segment.shortLabel;
      }
      segment.text = text;
    });

    this.updateBreakBand();
  }

  /**
   * Break pills are laid out against the week band's own geometry, so the two bands
   * always share boundaries.
   */
  private updateBreakBand(): void {
    this.breakSegments.forEach((segment) => {
      const left = this.pixelForFraction(segment.startFraction);
      const right = this.pixelForFraction(segment.endFraction);

      if (left === null || right === null) {
        segment.leftStyle = offsetStyle(segment.startFraction);
        segment.widthStyle = spanStyle(segment.endFraction - segment.startFraction);
        segment.text = segment.label;
        return;
      }

      const width = Math.max(right - left, 0);
      segment.leftStyle = `${left}px`;
      segment.widthStyle = `${width}px`;
      // Anything wider keeps the name and lets CSS truncate it.
      segment.text = width < BREAK_LABEL_MIN_WIDTH ? '' : segment.label;
    });
  }

  /**
   * Map a track fraction onto the pixel position the week band settled on, so both
   * bands share the same boundaries.
   */
  private pixelForFraction(fraction: number): number | null {
    if (this.weekBoundaries.length !== this.weekSegments.length + 1) {
      return null;
    }

    let index = this.weekSegments.findIndex((segment) => fraction <= segment.endFraction);
    if (index < 0) {
      index = this.weekSegments.length - 1;
    }

    const segment = this.weekSegments[index];
    const span = segment.endFraction - segment.startFraction;
    const ratio = span <= 0 ? 0 : (fraction - segment.startFraction) / span;
    const left = this.weekBoundaries[index];
    const right = this.weekBoundaries[index + 1];

    return left + Math.min(Math.max(ratio, 0), 1) * (right - left);
  }

  segmentClasses(segment: SnapshotWeekSegment): string {
    if (segment.isBreak) {
      return this.isActiveWeek(segment)
        ? 'bg-slate-300 font-semibold text-slate-700'
        : 'bg-slate-50 text-slate-400 hover:bg-slate-100';
    }

    return this.isActiveWeek(segment)
      ? 'bg-formatif-blue font-semibold text-white'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200';
  }

  private breakCampuses(teachingBreak: TeachingPeriodBreak): string {
    if (teachingBreak.campusIds.length === 0) {
      return 'All campuses';
    }

    const names = this.unit.tutorials
      .map((tutorial) => tutorial.campus)
      .filter((campus) => campus && teachingBreak.campusIds.includes(campus.id))
      .map((campus) => campus.name);

    return [...new Set(names)].join(', ');
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
      this.breakSegments = [];
      this.breakLaneCount = 0;
      return;
    }

    const groups: {
      key: string;
      weekNumber: number | null;
      teachingBreak: TeachingPeriodBreak | null;
      startIndex: number;
      endIndex: number;
    }[] = [];

    this.snapshots.forEach((snapshot, index) => {
      const date = new Date(snapshot.snapshot_date);
      // Only a break that pauses the week count has no week of its own. Breaks that
      // leave the count running are drawn in the band above, alongside their week.
      const teachingBreak = this.unit.teachingPeriod?.weekPausingBreakAt(date) ?? null;
      const weekNumber = teachingBreak ? null : displayWeekNumber(this.unit, date);
      // Nulls merge too, so a unit with no start date collapses to one suppressed segment.
      const key = teachingBreak ? `break-${teachingBreak.id}` : `week-${weekNumber}`;
      const current = groups[groups.length - 1];

      if (current && current.key === key) {
        current.endIndex = index;
      } else {
        groups.push({key, weekNumber, teachingBreak, startIndex: index, endIndex: index});
      }
    });

    const denominator = Math.max(total - 1, 1);

    this.weekSegments = groups.map((group) => {
      const startFraction = group.startIndex === 0 ? 0 : (group.startIndex - 0.5) / denominator;
      const endFraction = group.endIndex === total - 1 ? 1 : (group.endIndex + 0.5) / denominator;
      // A break's own label can be any length, so the band always says 'Break' and the tooltip
      // carries the real name.
      let label: string;
      let shortLabel: string;
      if (group.teachingBreak) {
        label = 'Break';
        shortLabel = 'Break';
      } else if (group.weekNumber === null) {
        label = 'Unscheduled';
        shortLabel = '–';
      } else {
        label = `Week ${group.weekNumber}`;
        shortLabel = `W${group.weekNumber}`;
      }
      const range = this.snapshotRangeLabel(group.startIndex, group.endIndex);
      const tooltip = group.teachingBreak
        ? [group.teachingBreak.label || 'Break', range, this.breakCampuses(group.teachingBreak)]
            .filter((part) => part)
            .join(' · ')
        : `${label} · ${range}`;

      return {
        key: `${group.key}-${group.startIndex}`,
        isBreak: group.teachingBreak !== null,
        label,
        shortLabel,
        text: label,
        tooltip,
        startIndex: group.startIndex,
        endIndex: group.endIndex,
        startFraction,
        endFraction,
        leftStyle: offsetStyle(startFraction),
        widthStyle: spanStyle(endFraction - startFraction),
      };
    });

    this.buildBreakSegments();
    this.updateWeekBand();
  }

  /**
   * Every break that overlaps the snapshot range, drawn over the weeks it spans.
   * A break that pauses the week count sits above its own 'Break' week segment; one
   * that does not runs alongside the teaching weeks it overlaps, which is why the
   * breaks need a band of their own.
   */
  private buildBreakSegments(): void {
    const total = this.snapshots.length;
    const breaks = this.unit.teachingPeriod?.breaks ?? [];

    if (total === 0 || breaks.length === 0) {
      this.breakSegments = [];
      this.breakLaneCount = 0;
      return;
    }

    const denominator = Math.max(total - 1, 1);
    const snapshotDates = this.snapshots.map((snapshot) => new Date(snapshot.snapshot_date));

    const spans = breaks
      .map((teachingBreak) => {
        const covered = snapshotDates.reduce<number[]>((acc, date, index) => {
          if (teachingBreak.covers(date)) {
            acc.push(index);
          }
          return acc;
        }, []);

        return covered.length === 0
          ? null
          : {
              teachingBreak,
              startIndex: covered[0],
              endIndex: covered[covered.length - 1],
            };
      })
      .filter((span) => span !== null)
      .sort((left, right) => left.startIndex - right.startIndex);

    // Campus specific breaks can run at the same time, so overlapping pills stack.
    const laneEnds: number[] = [];

    this.breakSegments = spans.map((span) => {
      let lane = laneEnds.findIndex((end) => end < span.startIndex);
      if (lane === -1) {
        lane = laneEnds.length;
      }
      laneEnds[lane] = span.endIndex;

      const startFraction = span.startIndex === 0 ? 0 : (span.startIndex - 0.5) / denominator;
      const endFraction = span.endIndex === total - 1 ? 1 : (span.endIndex + 0.5) / denominator;
      const label = span.teachingBreak.label || 'Break';
      const range = this.snapshotRangeLabel(span.startIndex, span.endIndex);

      return {
        key: `break-${span.teachingBreak.id}`,
        label,
        text: label,
        tooltip: [label, range, this.breakCampuses(span.teachingBreak)]
          .filter((part) => part)
          .join(' · '),
        lane,
        pausesWeekCount: span.teachingBreak.pauseWeekCount,
        startIndex: span.startIndex,
        endIndex: span.endIndex,
        startFraction,
        endFraction,
        leftStyle: offsetStyle(startFraction),
        widthStyle: spanStyle(endFraction - startFraction),
      };
    });

    this.breakLaneCount = laneEnds.length;
  }

  get breakBandHeight(): string {
    return `${this.breakLaneCount * BREAK_LANE_HEIGHT}px`;
  }

  breakLaneStyle(segment: SnapshotBreakSegment): string {
    return `${segment.lane * BREAK_LANE_HEIGHT}px`;
  }

  private snapshotRangeLabel(startIndex: number, endIndex: number): string {
    const start = formatSnapshotLabel(this.unit, this.snapshots[startIndex]?.snapshot_date);
    const end = formatSnapshotLabel(this.unit, this.snapshots[endIndex]?.snapshot_date);
    return start === end ? start : `${start} – ${end}`;
  }

  /**
   * Week 0 holds whatever came before the teaching period started, so it is usually a
   * few days rather than a full week and renders as a stub beside the other segments.
   * Pad the front with blank days so it takes a full week's width, and always leave at
   * least one blank day at the very start so the beginning of the data is visible.
   *
   * Only applies when there is a week 0 to begin with - a unit whose stats start on or
   * after week 1 is left alone.
   */
  private padWeekZero(snapshots: TaskCompletionSnapshot[]): TaskCompletionSnapshot[] {
    const firstDay = startOfDay(snapshots[0]?.snapshot_date);
    if (!firstDay) {
      return snapshots;
    }

    const weekZeroDays = snapshots.filter(
      (snapshot) => displayWeekNumber(this.unit, new Date(snapshot.snapshot_date)) === 0,
    ).length;

    if (weekZeroDays === 0) {
      return snapshots;
    }

    const blankDays = Math.max(DAYS_PER_WEEK - weekZeroDays, 1);
    const stats = this.notStartedStats(snapshots[0]);
    const padding: TaskCompletionSnapshot[] = [];

    for (let offset = blankDays; offset > 0; offset -= 1) {
      const day = addDays(firstDay, -offset);
      padding.push({
        snapshot_date: day.toISOString().slice(0, 10),
        snapshot_timestamp: `${Math.floor(day.getTime() / 1000)}`,
        stats,
        placeholder: true,
      });
    }

    return [...padding, ...snapshots];
  }

  /**
   * Stats for a filler day: every task sitting at not started, so the bars read as a
   * full column of 'not started' rather than the chart blanking out.
   *
   * The campus keys are copied from a real snapshot, because the campus filter is built
   * from whichever snapshot is selected - a filler day has to offer the same choices.
   */
  private notStartedStats(reference: TaskCompletionSnapshot): CampusStats {
    const taskCodes: Set<string> = new Set();
    Object.values(reference.stats).forEach((tutorials) =>
      Object.values(tutorials).forEach((taskStats) =>
        Object.keys(taskStats).forEach((taskCode) => taskCodes.add(taskCode)),
      ),
    );

    const notStarted: TaskCodeStats = {};
    taskCodes.forEach((taskCode) => (notStarted[taskCode] = {not_started: 1}));

    const stats: CampusStats = {};
    Object.entries(reference.stats).forEach(([campus, tutorials]) => {
      const tutorialCode = Object.keys(tutorials)[0];
      if (tutorialCode) {
        stats[campus] = {[tutorialCode]: notStarted};
      }
    });

    return stats;
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
        this.snapshots = this.padWeekZero(dropLeadingEmptySnapshots([...this.snapshots].reverse()));
        this.sliderSelect = Math.max(this.snapshots.length - 1, 0);
        this.campuses = Object.keys(this.snapshots[this.sliderSelect]?.stats ?? {});
        this.buildWeekSegments();
        this.changeDetectorRef.detectChanges();

        if (this.snapshots.length === 0 && !this.autoCaptureAttempted) {
          this.autoCaptureAttempted = true;
          this.captureNow();
        }
      },
      error: (error) => {
        console.error('Snapshot load failed', error);
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
        console.error('Snapshot capture failed', error);
        const errorMessage = error
          ? error.message || error.toString()
          : 'Failed to capture task completion snapshot.';
        this.alertService.error(errorMessage, 6000);
      },
    });
  }
}
