import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-who',
  templateUrl: 'task-definition-who.component.html',
  styleUrls: ['task-definition-who.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDefinitionWhoComponent {
  @Input() taskDefinition: TaskDefinition;

  showAllTutorials: boolean = false;
  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  onTutorialStreamChange() {
    this.showAllTutorials = false;
  }
}
