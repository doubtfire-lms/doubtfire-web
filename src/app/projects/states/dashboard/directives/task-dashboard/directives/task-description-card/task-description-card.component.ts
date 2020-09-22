import { Component, OnInit, SimpleChanges, Inject, Input} from '@angular/core';
import { analyticsService, alertService} from 'src/app/ajs-upgraded-providers';
import { gradeService, listenerService, Task } from 'src/app/ajs-upgraded-providers';
import { ExtensionModalService } from 'src/app/common/modals/extension-modal/extension-modal.service';

@Component({
  selector: 'TaskDescriptionCardComponent',
  templateUrl: './task-description-card.component.html',
  styleUrls: ['./task-description-card.component.scss'],
})

export class TaskDescriptionCardComponent implements OnInit {

  @Input() task: any;
  @Input() taskDef:any;
  @Input() unit: any;
  grades: any;
  urls: any;

  constructor(  
        @Inject(ExtensionModalService) private ExtensionModal: any,
        @Inject(Task) private Task: any,
 			  @Inject(analyticsService) private analyticsService: any,
        @Inject(gradeService) private  gradeService: any,
        // Grade services is yet to be converted into type script. 
        @Inject(alertService) private alertService: any,
//@Inject(listenerService) private listenerService: any,
  ){
       this.Task = Task;
       this.analyticsService = analyticsService;
       this.gradeService = gradeService;
       this.alertService = alertService;
      // this.listenerService = listenerService;
       this.grades = {
         names: this.gradeService.grades,
         acronyms: this.gradeService.gradeAcronyms
         };   
  }
  
  ngOnInit(): void {};

  downloadEvent(type: String) {
    this.analyticsService.event('Task Sheet', `Downloaded ${type}`);
  };

  //grades = Object.assign({
  //  names: this.gradeService.grades,
  //  acronyms: this.gradeService.gradeAcronyms
  //});

  dueDate(): String {
    if (this.task)
      return this.task.localDueDateString();
    else if (this.taskDef)
      return this.taskDef.target_date;
    else
      return "";
  };

  startDate(): String {
    if(this.taskDef)
      return this.taskDef.start_date;
    else
      return "";
  };

  shouldShowDeadline() {
      (this.task.daysUntilDeadlineDate() <= 14) || false;
  };

  ngOnChanges(changes: SimpleChanges): void {
    changes.taskDef.previousValue;
    let newTaskDef = changes.taskDef.currentValue
    // Resource download URLs
    this.urls = {
      taskSheet: `${this.Task.getTaskPDFUrl(this.unit, newTaskDef)}&as_attachment=true`,
      resources: this.Task.getTaskResourcesUrl(this.unit, newTaskDef)
    };
  }
}

