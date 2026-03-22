import { Component, Injector, Input, OnInit, ViewContainerRef } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {TaskService} from 'src/app/api/services/task.service';
import {GradeService} from 'src/app/common/services/grade.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Unit } from 'src/app/api/models/unit';
import {TooltipService} from '@swimlane/ngx-charts';

const actualData = {
  'Geelong': {
    '1.1P': {'1': 4, '2': 3, '9': 3, '10': 1},
    '1.2P': {'1': 4, '2': 3, '7': 1, '8': 1, '4': 1, '9': 1},
    '1.3P': {'1': 4, '2': 4, '9': 3},
    '1.4C': {'1': 6, '2': 4, '9': 1},
    '2.1P': {'1': 7, '2': 3, '9': 1},
    '2.2P': {'1': 7, '2': 3, '5': 1},
    '2.3P': {'1': 7, '2': 3, '9': 1},
    '2.4P': {'1': 7, '2': 4},
    '2.5C': {'1': 7, '2': 3, '9': 1},
    '3.1P': {'1': 8, '2': 3},
    '3.2P': {'1': 8, '2': 3},
    '3.3P': {'1': 8, '2': 2, '10': 1},
    '3.4C': {'1': 8, '2': 2, '5': 1},
    '3.5C': {'1': 8, '2': 1, '8': 1, '7': 1},
    '3.6D': {'1': 11},
    '4.1P': {'1': 8, '2': 1, '10': 1, '5': 1},
    '4.2C': {'1': 8, '2': 1, '10': 1, '9': 1},
    '4.3C': {'1': 8, '2': 1, '9': 2},
    'T1': {'1': 8, '2': 1, '9': 2},
    '5.1P': {'1': 10, '2': 1},
    '5.2P': {'1': 10, '2': 1},
    '5.3C': {'1': 10, '2': 1},
    '5.4C': {'1': 10, '8': 1},
    '5.5D': {'1': 11},
    '6.1P': {'1': 10, '9': 1},
    '7.1P': {'1': 11},
    '7.2D': {'1': 11},
    '8.1P': {'1': 11},
    '8.2P': {'1': 11},
    'T2': {'1': 11},
    '9.1P': {'1': 11},
    '9.2C': {'1': 11},
    '10.1H': {'1': 11},
    '10.2H': {'1': 11},
    '11.1P': {'1': 11},
    '6.2D': {'1': 11},
    'T10': {'1': 11},
  },
  'Online': {
    '1.1P': {'1': 3, '2': 2},
    '1.2P': {'1': 3, '2': 2},
    '1.3P': {'1': 3, '2': 2},
    '1.4C': {'1': 4, '2': 1},
    '2.1P': {'1': 3, '2': 2},
    '2.2P': {'1': 3, '2': 2},
    '2.3P': {'1': 3, '2': 2},
    '2.4P': {'1': 3, '2': 2},
    '2.5C': {'1': 4, '2': 1},
    '3.1P': {'1': 3, '2': 2},
    '3.2P': {'1': 3, '2': 1, '10': 1},
    '3.3P': {'1': 3, '2': 2},
    '3.4C': {'1': 4, '2': 1},
    '3.5C': {'1': 4, '2': 1},
    '3.6D': {'1': 4, '2': 1},
    '4.1P': {'1': 3, '2': 1, '9': 1},
    '4.2C': {'1': 4, '2': 1},
    '4.3C': {'1': 4, '2': 1},
    'T1': {'1': 3, '2': 1, '9': 1},
    '5.1P': {'1': 4, '10': 1},
    '5.2P': {'1': 4, '5': 1},
    '5.3C': {'1': 4, '2': 1},
    '5.4C': {'1': 4, '10': 1},
    '5.5D': {'1': 4, '2': 1},
    '6.1P': {'1': 4, '9': 1},
    '7.1P': {'1': 5},
    '7.2D': {'1': 5},
    '8.1P': {'1': 5},
    '8.2P': {'1': 5},
    'T2': {'1': 5},
    '9.1P': {'1': 5},
    '9.2C': {'1': 5},
    '10.1H': {'1': 5},
    '10.2H': {'1': 5},
    '11.1P': {'1': 5},
    '6.2D': {'1': 5},
    'T10': {'1': 5},
  },
};

@Component({
  selector: 'f-summary-task-status-chart',
  standalone: true,
  imports: [ NgxChartsModule, MatCardModule, MatFormField, MatSelectModule, MatOption, FormsModule ],
  templateUrl: './summary-task-status-chart.component.html',
  styleUrl: './summary-task-status-chart.component.scss'
})

export class SummaryTaskStatusChartComponent {
  @Input() unit: Unit;

  data: any[] = [];
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

  statusLabelsArr = Array.from(this.taskService.statusLabels.values());

  campusFilter: string = 'all';

  ngOnInit(): void {
    this.chartToolTipService.injectionService.setRootViewContainer(this.viewContainerRef);

    this.colorScheme.domain = [...this.taskService.statusLabels.keys()].map((label) => this.taskService.statusColors.get(label) || '#000000');
    this.refreshData();
  }

  refreshData() {
    const mergedData: Record<string, Record<string, number>> = {};

    // combine all campuses
    Object.values(actualData).forEach((campusData) => {
      Object.entries(campusData).forEach(([taskDef, counts]) => {
        mergedData[taskDef] = mergedData[taskDef] || {};
        Object.entries(counts).forEach(([status, value]) => {
          mergedData[taskDef][status] = (mergedData[taskDef][status] || 0) + value;
        });
      });
    });

    // if a campus filter is set, use only that campus
    const dataSource =
      this.campusFilter && this.campusFilter !== 'all' && actualData[this.campusFilter]
        ? actualData[this.campusFilter]
        : mergedData;

    // build chart series
    const data = Object.entries(dataSource).map(([taskDef, counts]) => ({
      name: taskDef,
      series: this.statusLabelsArr.map((label, idx) => ({
        name: label,
        value: counts[String(idx)] ?? 0,
      })),
    }));

    this.data = data;
  }

  onSelect(event: any) {
    console.log(event);
  }
}
