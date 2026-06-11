import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-task-sheet-view',
  templateUrl: './task-sheet-view.component.html',
  styleUrls: ['./task-sheet-view.component.scss'],
  standalone: false,
})
export class FTaskSheetViewComponent {
  @Input() taskDef: TaskDefinition;
}
