import {MultiSeries, TooltipService} from '@glitchtip/ng-charts';
import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import {TaskCodeStats, TaskCompletionSnapshot} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {TaskService} from 'src/app/api/services/task.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {getTaskStats, statusMapping} from '../chart-data-helpers';

@Component({
  selector: 'f-normalised-task-status-chart',
  templateUrl: './normalised-task-status-chart.component.html',
  styleUrl: './normalised-task-status-chart.component.scss',
  standalone: false,
})
export class NormalisedTaskStatusChartComponent implements OnChanges {
  @Input() unit: Unit;
  @Input() snapshot?: TaskCompletionSnapshot;
  @Input() campusFilter: string = 'all';
  @Input() colorScheme: {domain: string[]} = {domain: ['']};

  data: MultiSeries = [];

  // options
  XLabel: string = 'Task';
  YLabel: string = 'Percentage of Students';

  ngOnChanges(_: SimpleChanges): void {
    if (!this.unit || !this.snapshot) {
      this.data = [];
      return;
    }

    this.data = NormalisedTaskStatusChartComponent.buildData(
      this.unit,
      getTaskStats(this.snapshot, this.campusFilter),
      this.taskService.statusLabels,
    );
  }

  static buildData(
    unit: Unit,
    taskStats: TaskCodeStats,
    statusLabels: Map<string, string>,
  ): MultiSeries {
    const taskSeqByCode = new Map(
      unit.taskDefinitions.map((taskDefinition) => [
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
          name: statusLabels.get(status) || status,
          value: counts[status] || 0,
        })),
      }));
  }

  constructor(
    private taskService: TaskService,
    private alertService: AlertService,
    private chartToolTipService: TooltipService,
    private viewContainerRef: ViewContainerRef,
    private injectorObj: Injector,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }
}
