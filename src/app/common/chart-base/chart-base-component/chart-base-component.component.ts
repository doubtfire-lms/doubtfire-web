import {ChangeDetectionStrategy, Component, ViewContainerRef} from '@angular/core';

/**
 * @title chart-base-component
 * @desc This is a base class to be used with the ngx-charts library. It is used to set the root view container for the tooltip service, to avoid issues with the tooltip not displaying correctly.
 *
 * Child classes need to extend this class and call super() in the constructor, passing in the ViewContainerRef.
 */
@Component({
  templateUrl: './chart-base-component.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ChartBaseComponent {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
