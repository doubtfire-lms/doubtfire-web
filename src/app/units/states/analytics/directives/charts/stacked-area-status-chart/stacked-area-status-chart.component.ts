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
import {formatSnapshotLabel, getTaskStats, statusMapping} from '../chart-data-helpers';

@Component({
  selector: 'f-stacked-area-status-chart',
  templateUrl: './stacked-area-status-chart.component.html',
  standalone: false,
})
export class StackedAreaStatusChartComponent implements OnChanges {
  @Input() unit: Unit;
  @Input() snapshots: TaskCompletionSnapshot[] = [];
  @Input() campusFilter: string = 'all';

  weeklyData: MultiSeries = [];
  colorScheme = {domain: ['']};

  XAxisLabel: string = 'Week';
  YAxisLabel: string = 'Records';

  constructor(
    private taskService: TaskService,
    private chartToolTipService: TooltipService,
    private viewContainerRef: ViewContainerRef,
    private injectorObj: Injector,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unit'] || changes['snapshots'] || changes['campusFilter']) {
      this.colorScheme.domain = statusMapping.map(
        (status) => this.taskService.statusColors.get(status) || '#000000',
      );
      this.weeklyData = this.unit && this.snapshots.length ? this.buildWeeklyChartData() : [];
      this.changeDetectorRef.markForCheck();
    }
  }

  private buildWeeklyChartData(): MultiSeries {
    const lastSnapshotByWeek: Map<string, TaskCompletionSnapshot> = new Map();

    this.snapshots.forEach((snapshot) => {
      const weekNumber = formatSnapshotLabel(this.unit, snapshot.snapshot_date, 'short');
      if (weekNumber) {
        lastSnapshotByWeek.set(weekNumber, snapshot);
      }
    });

    const weeks = [...lastSnapshotByWeek.entries()].map(([name, snapshot]) => ({
      name,
      taskStats: getTaskStats(snapshot, this.campusFilter),
    }));

    return statusMapping.map((status) => ({
      name: this.taskService.statusLabels.get(status) || status,
      series: weeks.map((week) => ({
        name: week.name,
        value: Object.values(week.taskStats).reduce(
          (total, taskCounts) => total + (taskCounts[status] || 0),
          0,
        ),
      })),
    }));
  }
}
