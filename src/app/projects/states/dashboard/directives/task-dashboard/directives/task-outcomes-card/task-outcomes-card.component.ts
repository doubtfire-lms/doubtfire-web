import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TaskDefinition, Unit } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'task-outcomes-card',
  templateUrl: 'task-outcomes-card.component.html',
  styleUrls: ['task-outcomes-card.component.scss'],
})
export class TaskOutcomesCardComponent implements OnChanges{
  @Input() taskDef: TaskDefinition;
  @Input() unit: Unit;

  public alignments: Array<any> = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.alignments = this.unit.staffAlignmentsForTaskDefinition(changes.taskDef.currentValue);
  }
}
