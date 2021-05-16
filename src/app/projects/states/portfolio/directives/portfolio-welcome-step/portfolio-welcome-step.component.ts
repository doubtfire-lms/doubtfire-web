import { Component, Input} from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'portfolio-welcome-step',
  templateUrl: 'portfolio-welcome-step.component.html',
  styleUrls: ['portfolio-welcome-step.component.scss']
})
export class PortfolioWelcomeStepComponent 
{
  
  @Input() advanceActiveTab: (TabNumber : number) => void;
  //HTML componenet is read first so externalName is defined to prevent compilation errors
  externalName = {
    value: ""
  };
  
  constructor(private constants: DoubtfireConstants) 
  {
    constants.ExternalName.subscribe((result) => {​​​​​​​​
       this.externalName.value = result;
      }​​​​​​​​);
    }​​​​​​​​
} 