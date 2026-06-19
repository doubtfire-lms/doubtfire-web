import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Task} from 'src/app/api/models/doubtfire-model';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'task-list-item',
  templateUrl: 'task-list-item.component.html',
  styleUrls: ['task-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskListItemComponent implements OnInit {
  @Input() task: Task;
  @Input() setSelectedTask: (task: Task) => void;
  @Input() isSelectedTask: (task: Task) => boolean;

  public gradeNames: GradeService['grades'];

  constructor(private gs: GradeService) {}

  ngOnInit() {
    // Expose grade service names
    this.gradeNames = this.gs.grades;
  }
}
