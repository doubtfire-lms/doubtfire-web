import { Component,Input,Inject} from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'unit-ilo-edit-modal2',
  templateUrl: 'unit-ilo-edit-modal2.component.html',
})
export class UnitIloEditModal2Component {
  @Input() unit: any;
  
  @Input() ilo:{name: string, description: string, abbreviation: string }={name:"",description:"",abbreviation:""};
  public  isNew(): boolean {
    return this.ilo.name===""&&this.ilo.abbreviation===""&&this.ilo.description==="";
  }

  constructor(@Inject(alertService) private alerts: any, ) {
    
  
  }


  
  

  saveILO(){
    // if (this.isNew()) {
    //   IntendedLearningOutcome.create
    // }

    this.alerts.add('success', 'Intended Learning Outcome Added', 2000);
  }
  
  

}