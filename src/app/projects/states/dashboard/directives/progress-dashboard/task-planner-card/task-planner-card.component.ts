import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {Project} from 'src/app/api/models/project';

@Component({
  selector: 'f-task-planner-card',
  templateUrl: './task-planner-card.component.html',
  styleUrl: './task-planner-card.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatButton,
    RouterLink,
    MatIcon,
  ],
})
export class TaskPlannerCardComponent {
  @Input() project: Project;
  public get unit() {
    return this.project?.unit;
  }
}
