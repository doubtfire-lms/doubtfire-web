import { Component, Input } from '@angular/core';

@Component({
  selector: 'task-details-view',
  templateUrl: 'task-details-view.component.html',
  styleUrls: ['task-details-view.component.scss'],
})
export class TaskDetailsViewComponent{
  @Input() taskDef: any;
  @Input() unit: any;

  
}
