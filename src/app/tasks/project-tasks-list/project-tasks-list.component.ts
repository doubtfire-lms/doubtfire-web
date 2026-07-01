import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  GradeService,
  Project,
  Task,
  TaskService,
  TaskStatusEnum,
  Unit,
} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-project-tasks-list',
  templateUrl: './project-tasks-list.component.html',
  styleUrls: ['./project-tasks-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectTasksListComponent implements OnInit {
  @Input() unit?: Unit;
  @Input() project?: Project;
  @Output() selectTask = new EventEmitter();
  selectedTask: Task | null = null;

  groupTasks = [];

  constructor(
    public newTaskService: TaskService,
    public gradeService: GradeService,
  ) {}

  ngOnInit(): void {
    this.groupTasks.push(
      ...this.unit.groupSets.map((gs) => ({
        groupSet: gs,
        name: gs.name,
      })),
    );
    this.groupTasks.push({groupSet: null, name: 'Individual Work'});
  }

  statusClass(status: TaskStatusEnum): string {
    return this.newTaskService.statusClass(status);
  }

  statusText(status: TaskStatusEnum): string {
    return this.newTaskService.statusText(status);
  }

  get hideGroupSetName(): boolean {
    return this.unit.groupSets.length === 0;
  }

  taskText(task: Task): string {
    let result = task.definition.abbreviation;
    if (task.definition.isGraded) {
      if (task.grade !== undefined && task.grade !== null) {
        result += ` (${this.gradeService.gradeAbbreviation(task.grade, this.unit)})`;
      } else {
        result += ' (?)';
      }
    }
    if (task.definition.maxQualityPts > 0) {
      if (task.qualityPts >= 0) {
        result += ` (${task.qualityPts}/${task.definition.maxQualityPts})`;
      } else {
        result += ` (?/${task.definition.maxQualityPts})`;
      }
    }
    return result;
  }

  selectChip(task: Task): void {
    this.selectedTask = task;
  }
}
