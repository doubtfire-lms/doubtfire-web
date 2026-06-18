import {Component, Input} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-task-assessment-card',
  templateUrl: './task-assessment-card.component.html',
  styleUrls: ['./task-assessment-card.component.scss'],
  standalone: false,
})
export class TaskAssessmentCardComponent {
  constructor(
    private taskService: TaskService,
    private gradeService: GradeService,
  ) {}

  @Input() task: Task;
  gradeNames = this.gradeService.grades;
}
