import { Component, Input} from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'portfolio-welcome-step',
  templateUrl: 'portfolio-welcome-step.component.html',
  styleUrls: ['portfolio-welcome-step.component.scss']
})
export class PortfolioWelcomeStepComponent 
{
  @Input() advanceActiveTab: number;
  
  @Input() externalName: string;
  
  constructor(private constants: DoubtfireConstants) 
  {
    constants.ExternalName.subscribe((result) => {​​​​​​​​
       this.externalName = result;
      }​​​​​​​​);
    }​​​​​​​​
  

} 