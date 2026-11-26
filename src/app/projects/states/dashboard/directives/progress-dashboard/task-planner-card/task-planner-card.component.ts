import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project} from 'src/app/api/models/project';

@Component({
  selector: 'f-task-planner-card',
  templateUrl: './task-planner-card.component.html',
  styleUrl: './task-planner-card.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskPlannerCardComponent {
  @Input() project: Project;
  public get unit() {
    return this.project?.unit;
  }
}
