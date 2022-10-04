import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UIRouter } from '@uirouter/core';
import { Task } from 'src/app/api/models/task';
import { TaskService } from 'src/app/api/services/task.service';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader';
import { TaskAssessmentModalService } from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

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
  currentView: dashboardViews = dashboardViews.submission;
  constructor(
    private doubtfire: DoubtfireConstants,
    private taskService: TaskService,
    private taskAssessmentModal: TaskAssessmentModalService,
    private fileDownloader: FileDownloaderService,
    private router: UIRouter
  ) {}
  tutor = this.router.globals.params.tutor;
  urls;

  ngOnInit(): void {
    this.updateCurrentView();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.task) {
      this.urls = {
        taskSheetPdfUrl: this.task.definition.getTaskPDFUrl(),
        taskSubmissionPdfUrl: this.task.submissionUrl(),
        taskSubmissionPdfAttachmentUrl: this.task.submissionUrl(true),
        taskFilesUrl: this.task.submittedFilesUrl(),
      };
      this.updateCurrentView();
    }
  }

  overseerEnabled() {
    this.doubtfire.IsOverseerEnabled.value && this.task?.overseerEnabled();
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
