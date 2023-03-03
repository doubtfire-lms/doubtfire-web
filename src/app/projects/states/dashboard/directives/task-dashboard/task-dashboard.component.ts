import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UIRouter } from '@uirouter/core';
import * as _ from 'lodash';
import { Task } from 'src/app/api/models/task';
import { TaskService } from 'src/app/api/services/task.service';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader';
import { TaskAssessmentModalService } from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { SelectedTaskService } from '../../selected-task.service';

enum dashboardViews {
  'details',
  'submission',
  'task',
}

@Component({
  selector: 'f-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss'],
})
export class TaskDashboardComponent implements OnInit, OnChanges {
  @Input() task: Task;
  @Input() showSubmission: boolean;
  @Input() pdfUrl: string;

  get showingTaskPdf() {
    return this.selectedTask.showingTaskSheet;
  }

  currentView: dashboardViews = dashboardViews.submission;
  taskStatusData: any;
  constructor(
    private doubtfire: DoubtfireConstants,
    private taskService: TaskService,
    private taskAssessmentModal: TaskAssessmentModalService,
    private fileDownloader: FileDownloaderService,
    private router: UIRouter,
    private selectedTask: SelectedTaskService
  ) {}
  tutor = this.router.globals.params.tutor;
  urls;

  ngOnInit(): void {
    this.updateCurrentView();

    this.taskStatusData = {
      keys: _.sortBy(this.taskService.markedStatuses, (s) => this.taskService.statusSeq.get(s)),
      help: this.taskService.helpDescriptions,
      icons: this.taskService.statusIcons,
      labels: this.taskService.statusLabels,
      class: this.taskService.statusClass,
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.task && changes.task.currentValue) {
      this.urls = {
        taskSheetPdfUrl: changes.task.currentValue.definition.getTaskPDFUrl(),
        taskSubmissionPdfUrl: changes.task.currentValue.submissionUrl(),
        taskSubmissionPdfAttachmentUrl: changes.task.currentValue.submissionUrl(true),
        taskFilesUrl: changes.task.currentValue.submittedFilesUrl(),
      };
      this.updateCurrentView();
    }
  }

  public overseerEnabledObs = this.doubtfire.IsOverseerEnabled;

  overseerEnabled() {
    return this.doubtfire.IsOverseerEnabled.value && this.task?.overseerEnabled();
  }

  updateCurrentView() {
    if (this.showSubmission) {
      this.currentView = dashboardViews.submission;
    } else {
      this.currentView = dashboardViews.details;
    }
  }

  setSelectedDashboardView(view: dashboardViews) {
    this.currentView = view;
  }

  isCurrentView(view: dashboardViews) {
    return this.currentView === view;
  }

  showSubmissionHistoryModal() {
    this.taskAssessmentModal.show(this.task);
  }

  downloadSubmission() {
    this.fileDownloader.downloadFile(this.urls.taskSubmissionPdfAttachmentUrl, 'submission.pdf');
  }

  downloadSubmittedFiles() {
    this.fileDownloader.downloadFile(this.urls.taskFilesUrl, 'submitted-files.zip');
  }
}
