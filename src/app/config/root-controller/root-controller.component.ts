import {Component} from '@angular/core';
import {GlobalStateService} from '../../projects/states/index/global-state.service';

@Component({
  selector: 'f-root-controller',
  template: '',
})
export class RootControllerComponent {
  constructor(private globalStateService: GlobalStateService) {}
}
