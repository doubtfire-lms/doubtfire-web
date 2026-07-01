import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-task-definition-general',
  templateUrl: 'task-definition-general.component.html',
  styleUrls: ['task-definition-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDefinitionGeneralComponent {
  @Input() taskDefinition: TaskDefinition;

  constructor(private gradeService: GradeService) {}

  public get grades(): {value: number; viewValue: string}[] {
    return this.gradeService.gradeViewDataFor(this.unit);
  }

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
