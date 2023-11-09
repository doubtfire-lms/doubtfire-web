import { Component, Input } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { GradeService } from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-task-definition-general',
  templateUrl: 'task-definition-general.component.html',
  styleUrls: ['task-definition-general.component.scss'],
})
export class TaskDefinitionGeneralComponent {
  @Input() taskDefinition: TaskDefinition;

  public grades: { value: number; viewValue: string }[];

  constructor(private gradeService: GradeService) {
    this.grades = this.gradeService.gradeViewData.filter((grade) => grade.value !== -1);
  }

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
