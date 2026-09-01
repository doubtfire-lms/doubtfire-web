import {MultiSeries, TooltipService} from '@glitchtip/ng-charts';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {TaskService} from 'src/app/api/services/task.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-stacked-area-status-chart',
  templateUrl: './stacked-area-status-chart.component.html',
  styleUrl: './stacked-area-status-chart.component.css',
  standalone: false,
})
export class StackedAreaStatusChartComponent {
  @Input() weeklyData: MultiSeries = [];
  @Input() colorScheme: {domain: string[]} = {domain: ['']};

  XAxisLabel: string = 'Week';
  YAxisLabel: string = 'Records';

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
