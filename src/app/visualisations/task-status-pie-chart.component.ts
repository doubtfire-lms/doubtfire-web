
import { Component, Input, Inject, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { taskService } from 'src/app/ajs-upgraded-providers';
import { VisulizationService } from 'src/app/visualisations/visulization.service';


@Component({
  selector: 'task-status-pie-chart',
  templateUrl: './visualisation.component.html',
})
export class TaskStatusPieChartComponent implements OnInit {

  @Input() data: any;
  @Input() height: any;
  @Input() showLegend: any;

  options: any = {};
  config: any = {};
  total: number;
  colors: any;
  zeroMargin: { top: number; right: number; bottom: number; left: number; };

  constructor(@Inject(VisulizationService) private visualisationService: any, @Inject(taskService) private taskService: any) { }


  ngOnInit(): void {

    if (!_.isEmpty(this.data)) { // check empty object
      this.colors = this.taskService.statusColors;
      this.zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 }

      console.log(this.data)
      console.log(this.height)
      console.log(this.showLegend) 

      this.options = {
        chart: {
          type: 'pieChart',
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
      }

      this.config = {}
      const chart_setup = this.visualisationService.show('lineChart', 'Student Progress Burndown Chart', this.options, [], [], [])
    }
  }

}

function updateData() {
  this.total = _.chain(this.data).values().reduce((memo: any, num: any) => { memo + num }, 0).value()
  this.data = _.map(this.rawData, function (value, status) {

    return {
      key: this.taskService.statusLabels[status],
      y: value,
      status_key: status
    };
  });
}