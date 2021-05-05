import { Component, Input} from '@angular/core';

@Component({
  selector: 'portfolio-welcome-step',
  templateUrl: 'portfolio-welcome-step.component.html',
  styleUrls: ['portfolio-welcome-step.component.scss']
})
export class PortfolioWelcomeStepComponent 
{
  @Input() advanceActiveTab: number;
  @Input() externalName: any;
  constructor() 
  {

  }
} 
  