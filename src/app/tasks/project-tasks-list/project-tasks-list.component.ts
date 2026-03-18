import {Component, OnInit, Input, Inject, Output, EventEmitter} from '@angular/core';
import {analyticsService} from 'src/app/ajs-upgraded-providers';
import {Project, Unit, Task, TaskService, TaskStatusEnum, GradeService} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-project-tasks-list',
  templateUrl: './project-tasks-list.component.html',
  styleUrls: ['./project-tasks-list.component.scss'],
})
export class ProjectTasksListComponent implements OnInit {
  @Input() unit?: Unit;
  @Input() project?: Project;
  @Output() selectTask = new EventEmitter();
  selectedTask: Task | null = null;

  groupTasks = [];

  constructor(
    private newTaskService: TaskService,
    @Inject(analyticsService) private AnalyticsService,
    public gradeService: GradeService,
  ) {}

  ngOnInit(): void {
    this.AnalyticsService.event('Student Project View', 'Showed Task Button List');
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
      if (task.grade) {
        result += ` (${this.gradeService.gradeAcronyms[task.grade]})`;
      } else {
        result += ' (?)';
      }
    }
    if (task.definition.maxQualityPts > 0) {
      if (task.qualityPts) {
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
