import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {TaskAssessmentModalService} from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SelectedTaskService} from '../../selected-task.service';
import {DashboardViews} from '../../selected-task.service';
import {MatTabChangeEvent} from '@angular/material/tabs';

@Component({
    selector: 'f-task-dashboard',
    templateUrl: './task-dashboard.component.html',
    styleUrls: ['./task-dashboard.component.scss'],
    standalone: false
})
export class TaskDashboardComponent implements OnInit, OnChanges {
  @Input() task: Task;
  @Input() pdfUrl: string;
  public DashboardViews = DashboardViews;

  public taskStatusData: any;
  public tutor = false;
  public urls: {
    taskSubmissionPdfAttachmentUrl: string;
    taskFilesUrl: string;
    taskSheetPdfUrl?: string;
    taskSubmissionPdfUrl?: string;
  };
  public overseerEnabledObs = this.doubtfire.IsOverseerEnabled;
  public currentView: DashboardViews;

  public currentIndex;

  onTabChange(event: MatTabChangeEvent) {
    switch (event.index) {
      case 0:
        this.setSelectedDashboardView(DashboardViews.details);
        break;
      case 1:
        this.setSelectedDashboardView(DashboardViews.task);
        break;
      case 2:
        this.setSelectedDashboardView(DashboardViews.submission);
        break;
      case 3:
        this.setSelectedDashboardView(DashboardViews.similarity);
        break;
    }
  }

  constructor(
    private doubtfire: DoubtfireConstants,
    private taskService: TaskService,
    private taskAssessmentModal: TaskAssessmentModalService,
    private fileDownloader: FileDownloaderService,
    private route: ActivatedRoute,
    public selectedTaskService: SelectedTaskService,
  ) {}

  ngOnInit(): void {
    this.tutor = this.route.snapshot.queryParamMap.has('tutor');
    this.setSelectedDashboardView(DashboardViews.details);
    this.selectedTaskService.currentView$.subscribe((view) => {
      this.currentView = view;
      this.currentIndex = this.tabIndexForView(view);
    });

    this.taskStatusData = {
      keys: this.taskService.markedStatuses.slice().sort((a, b) => {
        return this.taskService.statusSeq.get(a) - this.taskService.statusSeq.get(b);
      }),
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
      this.setSelectedDashboardView(DashboardViews.details);
    }
  }

  setSelectedDashboardView(view: DashboardViews): void {
    this.selectedTaskService.currentView$.next(view);
    this.currentView = view;
    this.currentIndex = this.tabIndexForView(view);
  }

  private tabIndexForView(view: DashboardViews): number {
    switch (view) {
      case DashboardViews.task:
        return 1;
      case DashboardViews.submission:
        return 2;
      default:
        return 0;
    }
  }

  public get overseerEnabled() {
    return this.doubtfire.IsOverseerEnabled.value && this.task?.overseerEnabled;
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
