import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Task} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-user-badge',
  templateUrl: './user-badge.component.html',
  styleUrls: ['./user-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UserBadgeComponent {
  @Input() selectedTask: Task;

  get unselected(): boolean {
    return this.selectedTask == null;
  }

  get noUser(): boolean {
    return this.selectedTask == null;
  }

  get studentDashboardRoute(): unknown[] | null {
    return this.unselected ? null : ['/projects', this.selectedTask.project.id, 'dashboard'];
  }

  get studentTaskRoute(): unknown[] | null {
    return this.unselected
      ? null
      : [
          '/projects',
          this.selectedTask.project.id,
          'dashboard',
          this.selectedTask.definition.abbreviation,
        ];
  }
}
