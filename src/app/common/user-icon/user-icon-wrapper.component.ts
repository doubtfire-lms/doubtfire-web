import { UpgradeComponent } from '@angular/upgrade/static';
import { Directive, Input, Injector, ElementRef, SimpleChanges } from '@angular/core';

// This Angular directive will act as an interface to the "upgraded" AngularJS component
@Directive({selector: 'user-icon'})
export class UserIconComponentWrapper extends UpgradeComponent {
  @Input() user: any;
  @Input() size: any;
  @Input() email: any;

  constructor(elementRef: ElementRef, injector: Injector) {
    // We must pass the name of the directive as used by AngularJS to the super
    super('userIcon', elementRef, injector);
  }
}
