import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {Task} from 'src/app/api/models/doubtfire-model';
import {GradeService} from 'src/app/common/services/grade.service';
import {StatusIconComponent} from '../../../../../../common/status-icon/status-icon.component';

@Component({
  selector: 'task-list-item',
  templateUrl: 'task-list-item.component.html',
  styleUrls: ['task-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, MatTooltip, StatusIconComponent],
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
