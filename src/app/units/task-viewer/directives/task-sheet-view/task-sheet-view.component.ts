import { Component, Input, OnInit } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';

@Component({
  selector: 'f-task-sheet-view',
  templateUrl: './task-sheet-view.component.html',
  styleUrls: ['./task-sheet-view.component.scss'],
})
export class FTaskSheetViewComponent {
  @Input() taskDef: TaskDefinition;

}
