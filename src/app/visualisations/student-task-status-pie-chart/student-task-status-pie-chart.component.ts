import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Project} from 'src/app/api/models/doubtfire-model';
import {TaskService} from 'src/app/api/services/task.service';
import {TaskStatus} from 'src/app/api/models/task-status';
import {VisualisationService} from '../visualisation.service';
import {Nvd3ChartComponent} from '../nvd3-chart/nvd3-chart.component';
import {ChartConfig, PieChartDataPoint} from '../visualisation.types';

@Component({
  selector: 'f-student-task-status-pie-chart',
  template: '<f-nvd3-chart #chart [options]="options" [data]="data"></f-nvd3-chart>',
})
export class StudentTaskStatusPieChartComponent implements OnInit {
  @Input() project: Project;

  @ViewChild('chart') chartComponent: Nvd3ChartComponent;

  options: ChartConfig;
  data: PieChartDataPoint[] = [];

  constructor(
    private taskService: TaskService,
    private visualisationService: VisualisationService,
  ) {}

  ngOnInit(): void {
    if (!this.project?.activeTasks) return;
    this.buildOptions();
    this.updateData();
  }

  updateData(): void {
    this.data = [];
    TaskStatus.STATUS_LABELS.forEach((label, key) => {
      const count = this.project.tasksByStatus(key).length;
      this.data.push({key: label, y: count, statusKey: key});
    });
    setTimeout(() => this.chartComponent?.update(), 100);
  }

  private buildOptions(): void {
    const colors = this.taskService.statusColors;
    this.options = this.visualisationService.createOptions('pieChart', {
      color: (d: PieChartDataPoint) => colors.get(d.statusKey),
      x: (d: PieChartDataPoint) => d.key,
      y: (d: PieChartDataPoint) => d.y,
      showLabels: false,
      tooltip: {
        valueFormatter: (d: number) => {
          const fixed = d.toFixed();
          const pct = Math.round((d / this.project.activeTasks().length) * 100);
          const task = fixed === '1' ? 'task' : 'tasks';
          return `${fixed} ${task} (${pct}%)`;
        },
        keyFormatter: (d: string) => d,
      },
    });
  }
}
