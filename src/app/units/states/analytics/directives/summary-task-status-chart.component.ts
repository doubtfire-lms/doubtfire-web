import { Component, Injector, Input, OnInit, ViewContainerRef } from '@angular/core';
import {TaskService} from 'src/app/api/services/task.service';
import {GradeService} from 'src/app/common/services/grade.service';
import { Unit } from 'src/app/api/models/unit';
import {TooltipService} from '@swimlane/ngx-charts';
import { TaskStatusEnum } from 'src/app/api/models/doubtfire-model';

interface TaskCompletionSnapshot {
  snapshot_date: string;
  captured_at: string;
  stats: Record<string, Record<string, Record<string, Record<string, number>>>>;
}

@Component({
  selector: 'f-summary-task-status-chart',
  templateUrl: './summary-task-status-chart.component.html',
  styleUrl: './summary-task-status-chart.component.scss'
})

export class SummaryTaskStatusChartComponent {
  @Input() unit: Unit;

  data: any[] = [];
  snapshots: TaskCompletionSnapshot[] = [];
  campuses: string[] = [];
  tutorials: string[] = [];
  // view: any[] = [700, 300];

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
    domain: ['#5AA454', '#C7B42C', '#AAAAAA'],
  };

  constructor(
    private gradeService: GradeService,
    private taskService: TaskService,
    private chartToolTipService: TooltipService,
    private viewContainerRef: ViewContainerRef,
    private injectorObj: Injector,
  ) {
    // https://github.com/swimlane/ngx-charts/issues/1428#issuecomment-659237562
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }

  statusLabelsArr = Array.from(this.taskService.statusLabels.entries()) as [TaskStatusEnum, string][];

  campusFilter: string = 'all';

  ngOnInit(): void {
    this.chartToolTipService.injectionService.setRootViewContainer(this.viewContainerRef);

    this.colorScheme.domain = [...this.taskService.statusLabels.keys()].map((label) => this.taskService.statusColors.get(label) || '#000000');
    this.loadRecentSnapshot();
  }

  refreshData() {
    const mergedData: Record<string, Record<string, number>> = {};
    const recentSnapshot = this.snapshots[0]?.stats;

    if (!recentSnapshot) {
      this.data = [];
      this.campuses = [];
      return;
    }

    // combine all campuses

    this.campuses = []
    this.tutorials = []

    recentSnapshot && Object.entries(recentSnapshot).forEach(([campus, campusData]) => {
      this.campuses.push(campus);
      Object.entries(campusData).forEach(([tutorial, tutorialData]) => {
        if (!this.tutorials.includes(tutorial)) {
          this.tutorials.push(tutorial);
        }
        Object.entries(tutorialData).forEach(([taskDef, counts]) => {
          mergedData[taskDef] = mergedData[taskDef] || {};
          Object.entries(counts).forEach(([status, value]) => {
            mergedData[taskDef][status] = (mergedData[taskDef][status] || 0) + value;
          });
        });
      });
    });

    // if a campus filter is set, use only that campus
    const dataSource =
      this.campusFilter && this.campusFilter !== 'all' && recentSnapshot[this.campusFilter]
        ? this.aggregateCampusData(recentSnapshot[this.campusFilter])
        : mergedData;

    // build chart series
    const data = Object.entries(dataSource).map(([taskDef, counts]) => ({
      name: taskDef,
      series: this.statusLabelsArr.map(([statusKey, label]) => ({
        name: label,
        value: counts[statusKey] ?? 0,
      })),
    }));

    this.data = data;
  }

  private aggregateCampusData(campusData: Record<string, Record<string, Record<string, number>>>): Record<string, Record<string, number>> {
    return Object.values(campusData).reduce((acc, tutorialData) => {
      Object.entries(tutorialData).forEach(([taskDef, counts]) => {
        acc[taskDef] = acc[taskDef] || {};
        Object.entries(counts).forEach(([status, value]) => {
          acc[taskDef][status] = (acc[taskDef][status] || 0) + value;
        });
      });
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }

  onSelect(event: any) {
    console.log(event);
  }

  loadRecentSnapshot(): void {
    this.unit
      .getTaskCompletionSnapshots(undefined, undefined, 1)
      .subscribe({
        next: (data) => {
          this.snapshots = data as TaskCompletionSnapshot[];
          this.refreshData()
        },
        error: (error) => {
          console.log('Snapshot load failed', error);
        },

      });
  }

  captureNow(): void {
    this.unit.captureTaskCompletionSnapshot().subscribe({
      next: (snapshot) => {
        console.log('Snapshot captured successfully', 4000);
        this.loadRecentSnapshot();
      },
      error: (error) => {
        console.log('Snapshot capture failed', error);
      },
    });
  }
}
