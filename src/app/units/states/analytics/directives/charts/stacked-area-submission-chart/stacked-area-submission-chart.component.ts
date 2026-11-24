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

type SubmittedTaskCountDistributions = Record<
  string, // campus
  Record<
    string, // tutorial ('__all__' or tutorial name)
    Record<string, number> // e.g. "3,1,0,0": studentCount
  >
>;

type SubmittedTaskCountStudentCounts = {
  all: SubmittedTaskCountDistributions;
  target_grades: Record<string, SubmittedTaskCountDistributions>;
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

  XAxisLabel: string = 'Week';
  YAxisLabel: string = 'Students';

  xAxisTickFormatting = (val: string): string => {
    const [week, count] = String(val).split('-');
    const countNum = Number(count);

    if (countNum === 0) {
      return `Week ${week}`;
    }
    if (countNum > 0 && countNum % 7 === 0) {
      return 'Break';
    }
    return '';
  };

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
    console.log(this.snapshots);

    let lastWeek: number | string | null = null;
    let weekCounter = 0;

    const days = this.snapshots.map((snapshot) => {
      const week = this.unit.weekNumber(snapshot.snapshot_date);

      if (week === lastWeek) {
        weekCounter++;
      } else {
        lastWeek = week;
        weekCounter = 0;
      }

      return {
        name: `${week}-${weekCounter}`,
        submittedCounts: this.getFilteredSubmittedCounts(snapshot),
      };
    });

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
    const raw = snapshot.submitted_task_count_student_counts as unknown as
      SubmittedTaskCountStudentCounts | undefined;
    const allScope = raw?.all;
    if (!allScope) {
      return {};
    }

    const campuses = this.campusFilter === 'all' ? Object.keys(allScope) : [this.campusFilter];
    const tutorialKey = this.tutorialFilter === 'all' ? '__all__' : this.tutorialFilter;
    const totalsByTaskCount: Record<string, number> = {};

    for (const campus of campuses) {
      const distribution = allScope[campus]?.[tutorialKey] ?? {};

      for (const [gradeCountsKey, studentCount] of Object.entries(distribution)) {
        const totalTasks = gradeCountsKey
          .split(',')
          .reduce((sum, count) => sum + (Number(count) || 0), 0);

        const bucket = String(totalTasks);
        totalsByTaskCount[bucket] = (totalsByTaskCount[bucket] ?? 0) + studentCount;
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
