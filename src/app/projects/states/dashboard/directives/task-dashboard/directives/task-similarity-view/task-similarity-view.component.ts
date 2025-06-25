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
  @ViewChild('jplagIframe', {static: true}) jplagIframe!: ElementRef<HTMLIFrameElement>;
  panelOpenState = false;
  jplagOpenState = false;

  constructor(
    private taskSimilarityService: TaskSimilarityService,
    private alertsService: AlertService,
    private selectedTaskService: SelectedTaskService,
    private fileDownloaderService: FileDownloaderService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.task && changes.task.currentValue && this.task?.id) {
      this.jplagOpenState = false;
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
        this.alertsService.success('Similarity flag updated');
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
        this.alertsService.error(`Error accessing TurnItIn: ${err}`);
      },
    });
  }

  downloadJPLAGReport() {
    this.jplagOpenState = true;
    const taskDef = this.task.definition;
    this.fileDownloaderService.downloadBlob(
      `${AppInjector.get(DoubtfireConstants).API_URL}/units/${
        this.task.unit.id
      }/task_definitions/${taskDef.id}/jplag_report`,
      (resourceUrl: string, response: HttpResponse<Blob>) => {
        // Open in embedded iframe
        setTimeout(() => {
          const data = {
            type: 'jplag-zip',
            file: response.body,
            name: 'report.jplag',
          };
          this.jplagIframe.nativeElement.contentWindow?.postMessage(data, '*');
        }, 1000);

        // Open in external window
        // const viewerWindow = window.open(
        //   'http://localhost:5173',
        //   '_blank',
        //   `width=1600,height=800,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no,status=no`,
        // );
        // if (viewerWindow) {
        //   // Wait for the viewer to fully load
        //   setTimeout(() => {
        //     const data = {
        //       type: 'jplag-zip',
        //       file: response.body,
        //       name: 'report.jplag',
        //     };
        //     this.jplagIframe.nativeElement.contentWindow?.postMessage(data, '*');

        //     // viewerWindow.postMessage(data, '*');
        //   }, 1000);
        // }
      },
      (error) => {
        console.error(error);
      },
    );
  }
}
