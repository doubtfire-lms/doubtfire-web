import { Component } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'institution-settings',
  templateUrl: 'institution-settings.component.html',
  styleUrls: ['institution-settings.component.scss']
})
export class InstitutionSettingsComponent {

  constructor(
    private constants: DoubtfireConstants,
  ) { }

  public get overseerEnabled() : boolean {
    return this.constants.IsOverseerEnabled.value;
  }

  public get tiiEnabled() : boolean {
    return this.constants.IsTiiEnabled.value;
  }
}
