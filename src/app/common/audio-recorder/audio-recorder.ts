import { Directive, ElementRef, Injector } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';

// This Angular directive will act as an interface to the "upgraded" AngularJS component
@Directive({selector: 'audio-recorder'})
export class AudioCommentUpgrader extends UpgradeComponent {
  constructor(elementRef: ElementRef, injector: Injector) {
    // We must pass the name of the directive as used by AngularJS to the super
    super('audioRecorder', elementRef, injector);
  }
}
