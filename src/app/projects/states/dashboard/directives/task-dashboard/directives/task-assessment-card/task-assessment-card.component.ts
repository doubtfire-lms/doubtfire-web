import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-task-assessment-card',
  templateUrl: './task-assessment-card.component.html',
  styleUrls: ['./task-assessment-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskAssessmentCardComponent {
  constructor(
    private taskService: TaskService,
    private gradeService: GradeService,
  ) {}

  @Input() task: Task;

  get gradeNames() {
    return Object.fromEntries(
      this.task.unit.gradeDefinitions.map((definition) => [definition.value, definition.label]),
    );
  }

  get gradeStandardLabels(): string {
    return this.task.unit.gradeDefinitions
      .filter((definition) => definition.value >= 0)
      .map((definition) => definition.label)
      .join(', ');
  }
}
