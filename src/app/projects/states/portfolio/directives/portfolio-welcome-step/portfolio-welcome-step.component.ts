import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'portfolio-welcome-step',
  templateUrl: 'portfolio-welcome-step.component.html',
  styleUrls: ['portfolio-welcome-step.component.scss'],
})
export class PortfolioWelcomeStepComponent {
  @Input() advanceActiveTabs: any;
  constructor(private constants: DoubtfireConstants) {}
  public externalName: BehaviorSubject<string> = new BehaviorSubject<string>('OnTrack');

  public advanceActiveTab(input: any) {
    return this.advanceActiveTabs(input);
  }
  ngOnInit(): void {
    this.externalName = this.constants?.ExternalName;
  }
}
