import {Component, OnInit, Input, SimpleChanges} from '@angular/core';
import {Project, TaskStatus} from 'src/app/api/models/doubtfire-model';
import {ChartBaseComponent} from 'src/app/common/chart-base/chart-base-component/chart-base-component.component';

@Component({
  selector: 'f-task-status-pie-chart',
  templateUrl: './taskstatuspiechart.component.html',
  styleUrls: ['./taskstatuspiechart.component.scss'],
})
export class TaskStatusPieChartComponent extends ChartBaseComponent implements OnInit {
  @Input() project: Project;
  @Input() grade: number;

  data: {name: string; value: number}[] = [];
  colors: {name: string; value: string}[];
  view: number[] = [700, 400];

  ngOnInit(): void {
    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('grade' in changes && changes.grade.currentValue !== undefined) {
      this.updateData();
    }
  }

  updateData(): void {
    if (this.project) {
      const taskCounts = new Map(TaskStatus.STATUS_KEYS.map((status) => [status, 0]));
      const activeTasks = this.project.activeTasks();
      activeTasks.forEach((task) => {
        if (task.status) {
          taskCounts.set(task.status, (taskCounts.get(task.status) || 0) + 1);
        }
      });

      const sortOrder = [
        'not_started',
        'feedback_exceeded',
        'redo',
        'need_help',
        'working_on_it',
        'fix_and_resubmit',
        'ready_for_feedback',
        'discuss',
        'demonstrate',
        'complete',
        'fail',
        'time_exceeded',
      ];

      this.data = Array.from(taskCounts)
        .map(([status, count]) => {
          return {
            name: TaskStatus.STATUS_LABELS.get(status),
            value: count,
          };
        })
        .filter((task) => task.value > 0 || sortOrder.includes(task.name))
        .sort((a, b) => {
          let aIndex = sortOrder.indexOf(a.name);
          let bIndex = sortOrder.indexOf(b.name);

          aIndex = aIndex === -1 ? sortOrder.length : aIndex;
          bIndex = bIndex === -1 ? sortOrder.length : bIndex;

          return aIndex - bIndex;
        });

      this.colors = Array.from(TaskStatus.STATUS_COLORS).map(([status, color]) => {
        return {name: TaskStatus.STATUS_LABELS.get(status), value: color};
      });
    }
  }
}
