
import { Component, Input, Inject } from '@angular/core';
import * as _ from 'lodash';
import { visualisationProvider, taskService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-status-pie-chart',
  templateUrl: 'visualisation.html',
})
export class TaskStatusPieChartComponent {
  @Input() rawData: any;
  @Input() height: any;
  @Input() showLegend: any;

  data: any = [];
  options: any = {};
  config: any = {};
  total: number;
  colors: any;
  zeroMargin: { top: number; right: number; bottom: number; left: number; };

  constructor(@Inject(visualisationProvider) private visualisationProvider: any,
    @Inject(taskService) private taskService: any) {
    this.colors = this.taskService.statusColors;
    this.zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 }
  }

  ngDoCheck() {
    if (this.rawData == null) {
      return;
    }
  }

  updateData() {
    this.total = _.chain(this.rawData).values().
      reduce((memo: any, num: any) => { memo + num }, 0)
      .value()

    this.data = _.map(this.rawData, function (value, status) {
      return {
        key: this.taskService.statusLabels[status],
        y: value,
        status_key: status
      };
    });
  }

  createChart() {
    this.options = {
      color: function (d: { status_key: string | number; }, i: any) {
        return this.colors[d.status_key];
      },
      x: function (d: { key: any; }) {
        return d.key;
      },
      y: function (d: { y: any; }) {
        return d.y;
      },
      showLabels: false,
      margin: this.zeroMargin,
      height: this.height,
      legend: {
        padding: 64,
        margin: this.zeroMargin
      },
      showLegend: this.showLegend,
      tooltip: {
        valueFormatter: function (d: number) {
          var pct: string | number;
          pct = Math.round((d / this.total) * 100);
          return pct + "%";
        },
        keyFormatter: function (d: any) {
          return d;
        }
      }
    }
    this.config = {}
    this.visualisationProvider('pieChart', 'Task Status Summary Pie Chart', this.options, this.config)
  }
}
