import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-portfolio-welcome-step',
  templateUrl: 'portfolio-welcome-step.component.html',
  styleUrls: ['portfolio-welcome-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfolioWelcomeStepComponent implements OnInit {
  @Input() onAdvanceActiveTab?: (index: 1 | -1) => void;

  public externalName: string = 'OnTrack';

  constructor(private constants: DoubtfireConstants) {}

  ngOnInit(): void {
    this.constants.ExternalName.subscribe((name) => {
      this.externalName = name;
    });
  }

  goNextStep() {
    if (this.onAdvanceActiveTab) {
      this.onAdvanceActiveTab(1);
      return;
    }
  }
}
