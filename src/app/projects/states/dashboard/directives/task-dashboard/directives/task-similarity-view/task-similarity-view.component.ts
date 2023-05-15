import { Component, Inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { Task } from 'src/app/api/models/task';
import { TaskSimilarity } from 'src/app/api/models/task-similarity';
import { TaskSimilarityService } from 'src/app/api/services/task-similarity.service';

@Component({
  selector: 'f-task-similarity-view',
  templateUrl: './task-similarity-view.component.html',
  styleUrls: ['./task-similarity-view.component.scss'],
})
export class TaskSimilarityViewComponent implements OnChanges {
  @Input() task: Task;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  panelOpenState = false;

  constructor(private taskSimilarityService: TaskSimilarityService, @Inject(alertService) private alerts: any) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.task && changes.task.currentValue && this.task?.id) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.task?.fetchSimilarities().subscribe((_) => {
        console.log('similarities fetched');
      });
    }
  }

  toggleFlag(e: Event, similarity: TaskSimilarity) {
    e.stopPropagation();
    similarity.flagged = !similarity.flagged;
    this.taskSimilarityService
      .update({ taskId: similarity.task.id, id: similarity.id }, { entity: similarity })
      .subscribe((_) => {
        this.alerts.add('success', 'Updated', 1500);
        similarity.task.similarityFlag = similarity.task.similarityCache.currentValues
          .map((s) => {
            return s.flagged;
          })
          .reduce((a, b) => a || b, false);
      });
  }
}
