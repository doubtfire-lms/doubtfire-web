import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'f-student-task-list',
  standalone: true,
  imports: [],
  templateUrl: './student-task-list.component.html',
  styleUrl: './student-task-list.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StudentTaskListComponent {}
