import { Component, OnInit } from "@angular/core";

import { UnitService, Unit } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'tutor-times',
  templateUrl: './tutor-times.component.html',
  styleUrls: ['./tutor-times.component.scss']
})
export class TutorTimesComponent implements OnInit {
  unit: Unit | undefined;
  unitRole: string | undefined;
  units = ['SIT102', 'SIT123', 'SIT333', 'SIT374', 'SIT330'];
  selectedUnit = this.units[0];

  // Example data for the single bar chart
  allData = {
    SIT102: [
      { name: 'Task 1.1P', value: 10 },
      { name: 'Task 1.2C', value: 20 },
      { name: 'Task 2.1P', value: 15 }
    ],
    SIT123: [
      { name: 'Task 1.1P', value: 5 },
      { name: 'Task 1.2C', value: 12 },
      { name: 'Task 2.1P', value: 8 }
    ],
    SIT333: [
      { name: 'Task 1.1P', value: 7 },
      { name: 'Task 1.2C', value: 9 },
      { name: 'Task 2.1P', value: 6 }
    ],
    SIT374: [
      { name: 'Task 1.1P', value: 12 },
      { name: 'Task 1.2C', value: 15 },
      { name: 'Task 2.1P', value: 10 }
    ],
    SIT330: [
      { name: 'Task 1.1P', value: 8 },
      { name: 'Task 1.2C', value: 18 },
      { name: 'Task 2.1P', value: 12 }
    ]
  };

  chartData = this.allData[this.selectedUnit];

  // Grouped data for the multi-series bar chart
  tutorsGroupedData = [
    {
      name: 'Tutor1',
      series: [
        { name: 'SIT102', value: 60 },
        { name: 'SIT123', value: 10 },
        { name: 'SIT333', value: 34 }
      ]
    },
    {
      name: 'Tutor2',
      series: [
        { name: 'SIT374', value: 45 },
        { name: 'SIT330', value: 50 }
      ]
    }
  ];

  view: [number, number] = [1000, 500];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Tasks';
  yAxisLabel = 'Time Spent';
  colorScheme = {
    domain: ['#a259f7', '#6ec6ff', '#ff8a65', '#ffb347', '#b4ff65']
  };

  constructor(private unitService: UnitService) {}

  ngOnInit() {
    // Set a mock role for demonstration; replace with real logic if needed
    this.unitRole = 'Convenor';
    this.chartData = this.allData[this.selectedUnit];
  }

  onUnitChange() {
    this.chartData = this.allData[this.selectedUnit];
    // If you want to filter tutorsGroupedData by selectedUnit, do it here
  }

  onSelect(event: unknown) {
    console.log(event);
  }

  formatMinutesToHourMinute(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
