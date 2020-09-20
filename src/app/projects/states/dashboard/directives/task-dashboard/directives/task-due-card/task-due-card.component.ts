import { Component, Input, Inject, OnInit } from '@angular/core';
import { alertService, Task } from 'src/app/ajs-upgraded-providers';
//import { ExtensionModalComponent } from 'src/app/common/modals/extension-modal/extension-modal.component';

@Component({
  selector: 'task-due-card',
  templateUrl: 'task-due-card.component.html',
})
export class TaskDueCardComponent implements OnInit {  
  @Input() task: any;   
  // to add 
  // @Inject(ExtensionModalComponent) private extentionModal: any){} 
  constructor(
    @Inject(alertService) private alerts: any){}    
    // }
    ngOnInit(): void {
      console.log(this.task)       
    }    
}