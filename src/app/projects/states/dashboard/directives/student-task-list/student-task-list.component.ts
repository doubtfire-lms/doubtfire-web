import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {Project, Task} from 'src/app/api/models/doubtfire-model';
import {GradeService} from 'src/app/common/services/grade.service';

interface TaskData {
  selectedTask: Task | null;
  onSelectedTaskChange?: (task: Task | null) => void;
}

@Component({
  selector: 'f-student-task-list',
  templateUrl: './student-task-list.component.html',
  styleUrls: ['./student-task-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StudentTaskListComponent implements OnInit, OnChanges {
  @Input() project: Project;
  @Input() refreshTasks: () => void;
  @Input() taskData: TaskData;

  filteredTasks: Task[] = [];
  filters = {taskName: null as string | null};
  showCreatePortfolio = true;
  gradeNames: Record<string, string>;

  constructor(private gradeService: GradeService) {
    this.gradeNames = gradeService.grades;
  }

  ngOnInit(): void {
    this.refreshTasks = () => this.applyFilters();
    this.initProject();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.project && this.project) {
      this.initProject();
    }
  }

  private initProject(): void {
    if (!this.project || typeof this.project.calcTopTasks !== 'function') return;
    this.project.calcTopTasks();
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.project || typeof this.project.activeTasks !== 'function') return;
    let tasks = this.project.activeTasks();
    if (this.filters.taskName) {
      const searchName = this.filters.taskName.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.definition.name.toLowerCase().includes(searchName) ||
          task.definition.abbreviation.toLowerCase().includes(searchName),
      );
    }
    this.filteredTasks = tasks.sort((a, b) => (a.topWeight ?? 0) - (b.topWeight ?? 0));
    this.showCreatePortfolio =
      !this.filters.taskName || 'create portfolio'.includes(this.filters.taskName.toLowerCase());
  }

  setSelectedTask(task: Task): void {
    if (this.isSelectedTask(task)) {
      task = null;
    }
    this.taskData.selectedTask = task;
    this.taskData.onSelectedTaskChange?.(task);
    if (task) {
      this.scrollToTaskInList(task);
    }
  }

  isSelectedTask(task: Task): boolean {
    return task.definition.id === this.taskData?.selectedTask?.definition?.id;
  }

  // Show portfolio creation prompt when within 3 weeks of the unit end date
  nearEnd(): boolean {
    if (!this.project?.unit?.endDate) return false;
    const lateDate = new Date(this.project.unit.endDate);
    lateDate.setDate(lateDate.getDate() - 21);
    return new Date() > lateDate;
  }

  private scrollToTaskInList(task: Task): void {
    setTimeout(() => {
      const taskEl = document.querySelector(`#${task.taskKeyToIdString()}`);
      if (!taskEl) return;
      taskEl.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    });
  }
}
