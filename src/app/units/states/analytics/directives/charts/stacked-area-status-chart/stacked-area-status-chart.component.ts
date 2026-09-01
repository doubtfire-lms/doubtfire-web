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
import {AlertService} from 'src/app/common/services/alert.service';
import {formatSnapshotLabel, getTaskStats, statusMapping} from '../chart-data-helpers';

@Component({
  selector: 'f-stacked-area-status-chart',
  templateUrl: './stacked-area-status-chart.component.html',
  styleUrl: './stacked-area-status-chart.component.css',
  standalone: false,
})
export class StackedAreaStatusChartComponent implements OnChanges {
  @Input() unit: Unit;
  @Input() snapshots: TaskCompletionSnapshot[] = [];
  @Input() campusFilter: string = 'all';
  @Input() colorScheme: {domain: string[]} = {domain: ['']};

  data: MultiSeries = [];

  XAxisLabel: string = 'Week';
  YAxisLabel: string = 'Records';

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.unit) {
      this.data = [];
      return;
    }

    this.data = StackedAreaStatusChartComponent.buildData(
      this.unit,
      this.snapshots,
      this.campusFilter,
      this.taskService.statusLabels,
    );
  }

  static buildData(
    unit: Unit,
    snapshots: TaskCompletionSnapshot[],
    campusFilter: string,
    statusLabels: Map<string, string>,
  ): MultiSeries {
    const lastSnapshotByWeek: Map<string, TaskCompletionSnapshot> = new Map();

    snapshots.forEach((snapshot) => {
      const weekNumber = formatSnapshotLabel(unit, snapshot.snapshot_date, 'short');
      if (weekNumber) {
        lastSnapshotByWeek.set(weekNumber, snapshot);
      }
    });

    const snapshotsByWeek = [...lastSnapshotByWeek.values()];
    return statusMapping.map((status) => ({
      name: statusLabels.get(status) || status,
      series: snapshotsByWeek.map((snapshot) => {
        const taskStats = getTaskStats(snapshot, campusFilter);
        const value = Object.values(taskStats).reduce(
          (total, taskCounts) => total + (taskCounts[status] || 0),
          0,
        );

        return {
          name: formatSnapshotLabel(unit, snapshot.snapshot_date, 'short'),
          value,
        };
      }),
    }));
  }

  constructor(
    private taskService: TaskService,
    private alertService: AlertService,
    private chartToolTipService: TooltipService,
    private viewContainerRef: ViewContainerRef,
    private injectorObj: Injector,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }
}
