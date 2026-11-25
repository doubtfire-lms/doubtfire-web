import {MultiSeries, TooltipService} from '@glitchtip/ng-charts';
import {format, parseISO} from 'date-fns';
import {enAU} from 'date-fns/locale';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import {TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {displayWeekNumber} from '../chart-data-helpers';

type HoveredSubmissionPoint = {
  dateLabel: string;
  series: string;
  value: number;
  percentage: number;
  color: string;
};

@Component({
  selector: 'f-stacked-area-submission-chart',
  styleUrl: './stacked-area-submission-chart.component.scss',
  templateUrl: './stacked-area-submission-chart.component.html',
  standalone: false,
})
export class StackedAreaSubmissionChartComponent implements OnChanges {
  @Input() unit: Unit;
  @Input() snapshots: TaskCompletionSnapshot[] = [];
  @Input() campusFilter: string = 'all';
  @Input() tutorialFilter: string = 'all';
  @Input() taskGradeFilter: number[] = [];
  @Input() studentTargetGradeFilter: number[] = [];

  data: MultiSeries = [];
  colorScheme = {domain: ['']};
  hoveredPoint: HoveredSubmissionPoint | null = null;
  tooltipX = 0;
  tooltipY = 0;

  XAxisLabel: string = 'Week';
  YAxisLabel: string = 'Students';

  xAxisTicks: string[] = [];
  private xAxisTickLabels: Record<string, string> = {};
  xAxisTickFormatting = (val: string): string => this.xAxisTickLabels[String(val)] ?? '';

  constructor(
    private readonly chartToolTipService: TooltipService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injectorObj: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['unit'] ||
      changes['snapshots'] ||
      changes['campusFilter'] ||
      changes['tutorialFilter'] ||
      changes['taskGradeFilter'] ||
      changes['studentTargetGradeFilter']
    ) {
      this.hoveredPoint = null;
      this.data = this.unit && this.snapshots.length ? this.buildChartData() : [];
      this.changeDetectorRef.markForCheck();
    }
  }

  onPointActivate(event: {value: {name: string}}, snapshotDate: string): void {
    if (!snapshotDate) {
      return;
    }

    const seriesIndex = this.data.findIndex((series) => series.name === event.value.name);
    const series = this.data[seriesIndex];
    const point = series?.series.find((entry) => entry.name === snapshotDate);
    const percentage = point?.extra?.['percentage'];
    if (!point || typeof percentage !== 'number') {
      return;
    }

    this.hoveredPoint = {
      dateLabel: format(parseISO(snapshotDate), 'EEE do MMM yyyy', {locale: enAU}),
      series: String(series.name),
      value: point.value,
      percentage,
      color: this.colorScheme.domain[seriesIndex] ?? '#000000',
    };
    this.changeDetectorRef.markForCheck();
  }

  onPointDeactivate(event: {value: {name: string}}): void {
    if (this.hoveredPoint?.series === event.value.name) {
      this.hoveredPoint = null;
      this.changeDetectorRef.markForCheck();
    }
  }

  onChartMouseMove(event: MouseEvent): void {
    this.tooltipX = Math.max(8, Math.min(event.clientX + 12, window.innerWidth - 240));
    this.tooltipY = Math.max(8, Math.min(event.clientY + 12, window.innerHeight - 90));
  }

  private buildChartData(): MultiSeries {
    let lastSegment: string | null = null;
    const tickLabels: Record<string, string> = {};

    const days = this.snapshots.map((snapshot) => {
      const teachingBreak =
        this.unit.teachingPeriod?.weekPausingBreakAt(snapshot.snapshot_date) ?? null;
      const week = teachingBreak ? null : displayWeekNumber(this.unit, snapshot.snapshot_date);
      const segment = teachingBreak ? `break-${teachingBreak.id}` : `week-${week}`;

      if (segment !== lastSegment) {
        tickLabels[snapshot.snapshot_date] = teachingBreak
          ? 'Break'
          : week === null
            ? 'Unscheduled'
            : `Week ${week}`;
        lastSegment = segment;
      }

      const submittedCounts = this.getFilteredSubmittedCounts(snapshot);
      return {
        name: snapshot.snapshot_date,
        submittedCounts,
        totalStudents: Object.values(submittedCounts).reduce((sum, count) => sum + count, 0),
      };
    });
    this.xAxisTickLabels = tickLabels;
    this.xAxisTicks = Object.keys(tickLabels);

    const taskCountKeys = Array.from(
      new Set(days.flatMap((day) => Object.keys(day.submittedCounts))),
    ).sort((a, b) => Number(b) - Number(a));

    this.colorScheme = {
      domain: this.generateGradientColors(taskCountKeys.length),
    };

    return taskCountKeys.map((countKey) => ({
      name: `${countKey} ${countKey === '1' ? 'task' : 'tasks'}`,
      series: days.map((day) => {
        const students = day.submittedCounts[countKey] ?? 0;
        return {
          name: day.name,
          value: students,
          extra: {
            totalStudents: day.totalStudents,
            percentage: day.totalStudents
              ? Math.round((students / day.totalStudents) * 1000) / 10
              : 0,
          },
        };
      }),
    }));
  }

  private getFilteredSubmittedCounts(snapshot: TaskCompletionSnapshot): Record<string, number> {
    const counts = snapshot.submitted_task_count_student_counts;
    if (!counts) {
      return {};
    }

    const gradeValues = counts.task_grade_values ?? this.unit.gradeValues;
    const includedGradeIndexes = gradeValues.flatMap((grade, index) =>
      this.taskGradeFilter.length === 0 || this.taskGradeFilter.includes(grade) ? [index] : [],
    );
    const scopes = this.studentTargetGradeFilter.length
      ? this.studentTargetGradeFilter.map((grade) => counts.target_grades[grade.toString()] ?? {})
      : [counts.all];
    const tutorialKey = this.tutorialFilter === 'all' ? '__all__' : this.tutorialFilter;
    const totalsByTaskCount: Record<string, number> = {};

    for (const scope of scopes) {
      const campuses = this.campusFilter === 'all' ? Object.keys(scope) : [this.campusFilter];
      for (const campus of campuses) {
        const distribution = scope[campus]?.[tutorialKey] ?? {};

        for (const [gradeCountsKey, studentCount] of Object.entries(distribution)) {
          const gradeCounts = gradeCountsKey.split(',');
          const totalTasks = includedGradeIndexes.reduce(
            (sum, index) => sum + (Number(gradeCounts[index]) || 0),
            0,
          );

          const bucket = String(totalTasks);
          totalsByTaskCount[bucket] = (totalsByTaskCount[bucket] ?? 0) + studentCount;
        }
      }
    }

    return totalsByTaskCount;
  }

  private generateGradientColors(count: number): string[] {
    if (count <= 0) {
      return ['#000000'];
    }
    if (count === 1) {
      return ['hsl(145, 65%, 45%)'];
    }

    const startHue = 220;
    const endHue = 0;

    return Array.from({length: count}, (_, i) => {
      const ratio = i / (count - 1);
      const hue = Math.round(startHue + ratio * (endHue - startHue));
      return `hsl(${hue}, 65%, 50%)`;
    });
  }
}
