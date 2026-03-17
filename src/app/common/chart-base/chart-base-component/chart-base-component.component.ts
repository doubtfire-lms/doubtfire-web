import { Component, ViewContainerRef } from '@angular/core';
import { TooltipService } from '@swimlane/ngx-charts';
import { AppInjector } from "src/app/app-injector";

/**
 * @title chart-base-component
 * @desc This is a base class to be used with the ngx-charts library. It is used to set the root view container for the tooltip service, to avoid issues with the tooltip not displaying correctly.
 *
 * Child classes need to extend this class and call super() in the constructor, passing in the ViewContainerRef.
 */
@Component({
  template: `<p>chart-base-component works!</p>`,
})
export class ChartBaseComponent {
  constructor(public viewContainerRef: ViewContainerRef) {
    const chartToolTipService = AppInjector.get(TooltipService);
    chartToolTipService.injectionService.setRootViewContainer(this.viewContainerRef);
  }
}
