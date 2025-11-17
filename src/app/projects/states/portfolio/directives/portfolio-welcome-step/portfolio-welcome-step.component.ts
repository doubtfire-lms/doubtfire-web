import {Component, OnInit, Injector} from '@angular/core';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-portfolio-welcome-step',
  templateUrl: 'portfolio-welcome-step.component.html',
  styleUrls: ['portfolio-welcome-step.component.scss'],
})
export class PortfolioWelcomeStepComponent implements OnInit {
  public externalName: string = 'OnTrack';

  constructor(
    private constants: DoubtfireConstants,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    this.constants.ExternalName.subscribe((name) => {
      this.externalName = name;
    });
  }

  goNextStep() {
    // TODO: remove this once parent component is migrated
    this.injector.get('$scope').advanceActiveTab(1);
  }
}
