import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Color } from 'd3';
import { Project, TaskStatus, TaskStatusEnum } from 'src/app/api/models/doubtfire-model';
@Component({
  selector: 'f-task-visualisation',
  templateUrl: './taskvisualisation.component.html',
  styleUrls: ['./taskvisualisation.component.scss']
})

export class TaskVisualisationComponent implements OnInit {
  @Input() project: Project;
  @Input() grade: number;

  data: {name: string, value: number}[] = [];
  colors: {name: string, value: string}[];
  view: number[] = [700, 400];

  // options
  textColor: string = '#F5F5F5';


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

      const sortOrder = ['Complete', 'Discuss', 'Awaiting Feedback', 'Working On It', 'Not Started'];

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
        return { name: TaskStatus.STATUS_LABELS.get(status), value: color };
      });

      // console.log('Data:', this.data);
      // console.log('Colors:', this.colors);
    }
  }

  onSelect(event) {
    console.log(event);
  }
}
