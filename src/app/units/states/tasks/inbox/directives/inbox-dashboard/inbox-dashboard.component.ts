import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {Task} from 'src/app/api/models/task';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';

enum InboxDashboardTab {
  submission = 0,
  taskSheet = 1,
  similarities = 2,
  overseer = 3,
  staffNotes = 4,
  tutorNotes = 5,
}

@Component({
    selector: 'f-inbox-dashboard',
    templateUrl: './inbox-dashboard.component.html',
    host: { 'class': 'block h-full' },
    standalone: false
})
export class InboxDashboardComponent implements OnChanges {
  @Input() task: Task;
  @Output() visiblePdfUrlChange = new EventEmitter<string>();

  public readonly InboxDashboardTab = InboxDashboardTab;
  public currentTab: InboxDashboardTab = InboxDashboardTab.submission;
  public currentIndex = InboxDashboardTab.submission;

  constructor(private fileDownloader: FileDownloaderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.task) {
      this.selectDefaultTab();
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.setSelectedTab(event.index as InboxDashboardTab);
  }

  downloadSubmission(): void {
    if (!this.task?.hasPdf) {
      return;
    }

    this.fileDownloader.downloadFile(this.task.submissionUrl(true), 'submission.pdf');
  }

  downloadSubmittedFiles(): void {
    if (!this.task) {
      return;
    }

    this.fileDownloader.downloadFile(this.task.submittedFilesUrl(), 'submitted-files.zip');
  }

  public get overseerEnabled(): boolean {
    return this.task?.overseerEnabled ?? false;
  }

  private selectDefaultTab(): void {
    if (this.task) {
      this.setSelectedTab(InboxDashboardTab.submission);
    } else {
      this.currentTab = InboxDashboardTab.submission;
      this.currentIndex = InboxDashboardTab.submission;
      this.visiblePdfUrlChange.emit(null);
    }
  }

  private setSelectedTab(tab: InboxDashboardTab): void {
    this.currentTab = tab;
    this.currentIndex = tab;
    this.visiblePdfUrlChange.emit(this.pdfUrlForTab(tab));
  }

  private pdfUrlForTab(tab: InboxDashboardTab): string {
    if (!this.task) {
      return null;
    }

    switch (tab) {
      case InboxDashboardTab.submission:
        return this.task.hasPdf ? this.task.submissionUrl() : null;
      case InboxDashboardTab.taskSheet:
        return this.task.definition?.hasTaskSheet ? this.task.definition.getTaskPDFUrl() : null;
      default:
        return null;
    }
  }
}
