import { Component, Input, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'portfolio-welcome-step',
  templateUrl: 'portfolio-welcome-step.component.html',
  styleUrls: ['portfolio-welcome-step.component.scss']
})
export class PortfolioWelcomeStepComponent 
{
  @Input() advanceActiveTab: any;
  @Input() externalName: any;
  constructor() 
  {

  }
} 
  