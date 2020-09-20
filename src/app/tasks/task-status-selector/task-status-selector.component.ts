import { Component, OnInit,Input, Inject } from '@angular/core';
import { taskService } from 'src/app/ajs-upgraded-providers';
import { any } from '@uirouter/angular';

@Component({
  selector: 'app-task-status-selector',
  templateUrl: './task-status-selector.component.html',
  styleUrls: ['./task-status-selector.component.scss']
})

export class TaskStatusSelectorComponent implements OnInit {

  @Input() task: any;
  @Input() assessingUnitRole: any;
  @Input() inMenu: any;
  @Input() triggerTransition:any;
  @Input() studentTriggers: any;
  @Input() tutorTriggers: any;
  @Input() status: any;  
  @Input()  statusClass: any; 
  @Input()  statusIcon: any;
  @Input()  statusLabel:any;
  @Input()  filterFutureStates: any;
  
  
  constructor(
    @Inject(taskService)  public  taskService:any )
      
   { }
        
   ngOnInit(): void {
  }

   studentStatuses = this.taskService.switchableStates.student;
  tutorStatuses    = this.taskService.switchableStates.tutor;

  taskEngagementConfig = {
    studentTriggers: this.studentStatuses.map(this.taskService.statusData),
    tutorTriggers:  this.tutorStatuses.map (this.taskService.statusData) 
  }
 
}