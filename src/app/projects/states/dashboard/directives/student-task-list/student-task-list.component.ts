import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'f-student-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-task-list.component.html',
  styleUrl: './student-task-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentTaskListComponent {}
