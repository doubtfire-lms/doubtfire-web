/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'timeout',
  templateUrl: './timeout.component.html',
})
export class TimeoutComponent {
  @Input() task: any;
  @Input() taskDef: any;
  @Input() unit: any;
}

