import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Task } from 'src/app/api/models/task';
import { TaskSimilarity } from 'src/app/api/models/task-similarity';
import { TaskSimilarityService } from 'src/app/api/services/task-similarity.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { SelectedTaskService } from '../../../../selected-task.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { AppInjector } from 'src/app/app-injector';

@Component({
  selector: 'f-task-similarity-view',
  templateUrl: './task-similarity-view.component.html',
  styleUrls: ['./task-similarity-view.component.scss'],
})
export class TaskSimilarityViewComponent implements OnChanges {
  @Input() task: Task;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  panelOpenState = false;

  constructor(
    private taskSimilarityService: TaskSimilarityService,
    private alertsService: AlertService,
    private selectedTaskService: SelectedTaskService,
    private fileDownloaderService: FileDownloaderService,
  ) {}

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
        this.alertService.success('Similarity flag updated');
        similarity.task.similarityFlag = similarity.task.similarityCache.currentValues
          .map((s) => {
            return s.flagged;
          })
          .reduce((a, b) => a || b, false);
        this.selectedTaskService.checkFooterHeight();
      });
  }

  openReport(e: Event, similarity: TaskSimilarity) {
    e.stopPropagation();
    // Open similarity report in new tab
    similarity.fetchSimilarityReportUrl().subscribe({
      next: (url) => {
        window.open(url, '_blank');
      },
      error: (err) => {
        this.alertService.error(`Error accessing TurnItIn: ${err}`);
      },
    });
  }

  downloadJPLAGReport() {
    const taskDef = this.task.definition;
    this.fileDownloaderService.downloadFile(
      //this.taskData.selectedTask.jplagReportUrl()
      `${AppInjector.get(DoubtfireConstants).API_URL}/units/${
        this.task.unit.id
      }/task_definitions/${taskDef.id}/jplag_report`,
      `${this.task.unit.code}-${taskDef.abbreviation}-jplag-report.zip`,
    );
    window.open('https://jplag.github.io/JPlag/', '_blank');
  }
}
