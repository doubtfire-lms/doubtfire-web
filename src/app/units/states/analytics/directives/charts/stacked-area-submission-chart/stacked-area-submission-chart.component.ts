import {MultiSeries, TooltipService} from '@glitchtip/ng-charts';
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
      this.data = this.unit && this.snapshots.length ? this.buildChartData() : [];
      this.changeDetectorRef.markForCheck();
    }
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

      return {
        name: snapshot.snapshot_date,
        submittedCounts: this.getFilteredSubmittedCounts(snapshot),
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
      name: `${countKey} tasks`,
      series: days.map((day) => ({
        name: day.name,
        value: day.submittedCounts[countKey] ?? 0,
      })),
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
