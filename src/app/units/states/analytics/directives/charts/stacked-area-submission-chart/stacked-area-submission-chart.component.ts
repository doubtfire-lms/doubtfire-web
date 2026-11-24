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
import {TaskService} from 'src/app/api/services/task.service';
import {getTaskStats, statusMapping} from '../chart-data-helpers';

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

  XAxisLabel: string = 'Date';
  YAxisLabel: string = 'Tasks';

  constructor(
    private readonly taskService: TaskService,
    private readonly chartToolTipService: TooltipService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injectorObj: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }

  //if something changes, build the data
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['unit'] ||
      changes['snapshots'] ||
      changes['campusFilter'] ||
      changes['tutorialFilter'] ||
      changes['taskGradeFilter'] ||
      changes['studentTargetGradeFilter']
    ) {
      this.colorScheme.domain = statusMapping.map(
        (status) => this.taskService.statusColors.get(status) || '#000000',
      );
      this.data = this.unit && this.snapshots.length ? this.buildChartData() : [];
      this.changeDetectorRef.markForCheck();
    }
  }

  private buildChartData(): MultiSeries {
    //console.log(this.snapshots);

    const days = [...this.snapshots.entries()].map(([name, snapshot]) => ({
      name: snapshot.snapshot_date,
      taskStats: getTaskStats(
        snapshot,
        this.campusFilter,
        this.tutorialFilter,
        this.taskGradeFilter,
        this.studentTargetGradeFilter,
        this.unit,
      ),
      submittedCounts: snapshot.submitted_task_count_student_counts ?? {},
    }));

    // Collect all unique task count keys across snapshots (e.g., "0", "1", "2", ...)
    const taskCountKeys = Array.from(
      new Set(days.flatMap((day) => Object.keys(day.submittedCounts))),
    ).sort((a, b) => Number(b) - Number(a));

    //above, swap Number(b) - Number(a)) to flip y axis

    return taskCountKeys.map((countKey) => ({
      name: `${countKey} tasks`,
      series: days.map((day) => ({
        name: day.name,
        value: day.submittedCounts[countKey] ?? 0,
      })),
    }));
  }
}
