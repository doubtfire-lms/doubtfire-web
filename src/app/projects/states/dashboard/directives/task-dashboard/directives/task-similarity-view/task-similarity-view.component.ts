import {Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {Task} from 'src/app/api/models/task';
import {TaskSimilarity} from 'src/app/api/models/task-similarity';
import {TaskSimilarityService} from 'src/app/api/services/task-similarity.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {SelectedTaskService} from '../../../../selected-task.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {AppInjector} from 'src/app/app-injector';
import {HttpResponse} from '@angular/common/http';

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
      .update({taskId: similarity.task.id, id: similarity.id}, {entity: similarity})
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

  viewJplagReport() {
    // Students are identified by their username in JPlag reports (configured by API)
    // In most cases, usernames are a combination of their first and last names
    const studentUsername = this.task.project.student.username;

    const taskDef = this.task.definition;
    this.fileDownloaderService.downloadBlob(
      `${AppInjector.get(DoubtfireConstants).API_URL}/units/${
        this.task.unit.id
      }/task_definitions/${taskDef.id}/jplag_report`,
      (_, response: HttpResponse<Blob>) => {
        // Open JPlag report viewer in embedded iframe
        setTimeout(() => {
          // Send the JPlag report to load
          this.jplagIframe.nativeElement.contentWindow?.postMessage({
            type: 'upload-jplag-file',
            file: response.body,
            name: 'report.jplag',
          });
          setTimeout(() => {
            // Search comparisons by student username, auto load comparisons if only one is found
            this.jplagIframe.nativeElement.contentWindow?.postMessage({
              type: 'set-search-filter-value',
              filter: studentUsername,
              autoViewComparison: true,
            });
            this.jplagOpenState = true;
          }, 100);
        }, 100);
      },
      (error) => {
        console.error(error);
      },
    );
  }
}
