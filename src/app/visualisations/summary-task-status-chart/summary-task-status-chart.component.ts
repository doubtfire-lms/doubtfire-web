import {Component, Input, OnInit} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {TaskService} from 'src/app/api/services/task.service';
import {GradeService} from 'src/app/common/services/grade.service';

const actualData = {
  '1.1P': {'1': 7, '2': 5, '9': 3, '10': 1},
  '1.2P': {'1': 7, '2': 5, '7': 1, '8': 1, '4': 1, '9': 1},
  '1.3P': {'1': 7, '2': 6, '9': 3},
  '1.4C': {'1': 10, '2': 5, '9': 1},
  '2.1P': {'1': 10, '2': 5, '9': 1},
  '2.2P': {'1': 10, '2': 5, '5': 1},
  '2.3P': {'1': 10, '2': 5, '9': 1},
  '2.4P': {'1': 10, '2': 6},
  '2.5C': {'1': 11, '2': 4, '9': 1},
  '3.1P': {'1': 11, '2': 5},
  '3.2P': {'1': 11, '2': 4, '10': 1},
  '3.3P': {'1': 11, '2': 4, '10': 1},
  '3.4C': {'1': 12, '2': 3, '5': 1},
  '3.5C': {'1': 12, '2': 2, '8': 1, '7': 1},
  '3.6D': {'1': 15, '2': 1},
  '4.1P': {'1': 11, '2': 2, '10': 1, '9': 1, '5': 1},
  '4.2C': {'1': 12, '2': 2, '10': 1, '9': 1},
  '4.3C': {'1': 12, '2': 2, '9': 2},
  'T1': {'1': 11, '2': 2, '9': 3},
  '5.1P': {'1': 14, '2': 1, '10': 1},
  '5.2P': {'1': 14, '2': 1, '5': 1},
  '5.3C': {'1': 14, '2': 2},
  '5.4C': {'1': 14, '8': 1, '10': 1},
  '5.5D': {'1': 15, '2': 1},
  '6.1P': {'1': 14, '9': 2},
  '7.1P': {'1': 16},
  '7.2D': {'1': 16},
  '8.1P': {'1': 16},
  '8.2P': {'1': 16},
  'T2': {'1': 16},
  '9.1P': {'1': 16},
  '9.2C': {'1': 16},
  '10.1H': {'1': 16},
  '10.2H': {'1': 16},
  '11.1P': {'1': 16},
  '6.2D': {'1': 16},
  'T10': {'1': 16},
};

@Component({
  selector: 'f-summary-task-status-chart',
  templateUrl: './summary-task-status-chart.component.html',
  styleUrl: './summary-task-status-chart.component.scss',
})
export class SummaryTaskStatusChartComponent implements OnInit {
  @Input() unit: Unit;

  data = [];

  // view: any[] = [700, 400];

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
  ) {}

  statusLabelsArr = Array.from(this.taskService.statusLabels.values());

  ngOnInit(): void {
    this.colorScheme.domain = [...this.taskService.statusColors.values()];

    const data = Object.entries(actualData).map(([taskDef, counts]) => ({
      name: taskDef,
      series: this.statusLabelsArr.map((label, idx) => ({
        name: label,
        value: counts[String(idx)] ?? 0,
      })),
    }));

    this.data = data;

    console.log(data);
  }

  onSelect(event) {
    console.log(event);
  }
}
