import {Component, Injector, Input, OnInit, ViewContainerRef} from '@angular/core';
import {TooltipService} from '@swimlane/ngx-charts';
import {Project} from 'src/app/api/models/project';

@Component({
  selector: 'f-project-progress-gauge',
  templateUrl: './project-progress-gauge.component.html',
  styleUrl: './project-progress-gauge.component.css',
})
export class ProjectProgressGaugeComponent implements OnInit {
  @Input() project: Project;

  protected gaugeData = [
    {
      'name': 'Pass',
      'value': 100,
    },
    {
      'name': 'Credit',
      'value': 79,
    },
    {
      'name': 'Distinction',
      'value': 40,
    },
    {
      'name': 'HD',
      'value': 19,
    },
  ];

  ngOnInit(): void {
    this.chartToolTipService.injectionService.setRootViewContainer(this.viewContainerRef);

    console.log(this.project.taskStats);
  }

  constructor(private injectorObj: Injector) {
    this.chartToolTipService = this.injectorObj.get(TooltipService);
    this.viewContainerRef = this.injectorObj.get(ViewContainerRef);
  }
  private chartToolTipService: TooltipService;
  readonly viewContainerRef: ViewContainerRef;

  smallView = [90, 90];
  view = [500, 500];
  legend: boolean = true;
  legendPosition: string = 'below';

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };
}
