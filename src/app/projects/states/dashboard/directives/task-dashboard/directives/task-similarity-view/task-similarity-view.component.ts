import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Task } from 'src/app/api/models/task';
import { TaskSimilarity } from 'src/app/api/models/task-similarity';

@Component({
  selector: 'f-task-similarity-view',
  templateUrl: './task-similarity-view.component.html',
  styleUrls: ['./task-similarity-view.component.scss'],
})
export class TaskSimilarityViewComponent implements OnChanges {
  @Input() task: Task;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  panelOpenState = false;

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
  }
}
