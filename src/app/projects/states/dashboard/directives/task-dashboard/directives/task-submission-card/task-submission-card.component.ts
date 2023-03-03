import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { alertService, uploadSubmissionModal } from 'src/app/ajs-upgraded-providers';
import { Task } from 'src/app/api/models/task';
import { TaskService } from 'src/app/api/services/task.service';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader';

@Component({
  selector: 'f-task-submission-card',
  templateUrl: './task-submission-card.component.html',
  styleUrls: ['./task-submission-card.component.scss'],
})
export class TaskSubmissionCardComponent implements OnChanges {
  @Input() task: Task;
  canReuploadEvidence: boolean;
  canRegeneratePdf: boolean;
  submission: { isProcessing: boolean; isUploaded: boolean };
  urls: { pdf: string; files: string };

  constructor(
    private taskService: TaskService,
    @Inject(uploadSubmissionModal) private UploadSubmissionModal,
    @Inject(alertService) private AlertService,
    private fileDownloader: FileDownloaderService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.task) {
      this.reapplySubmissionData();
    }
  }

  reapplySubmissionData(): void {
    this.task.getSubmissionDetails().subscribe(() => {
      this.canReuploadEvidence = this.task.inSubmittedState();
      this.canRegeneratePdf = this.taskService.pdfRegeneratableStatuses.includes(this.task.status) && this.task.hasPdf;
      this.submission = {
        isProcessing: this.task.processingPdf,
        isUploaded: this.task.hasPdf,
      };
      this.urls = {
        pdf: this.task.submissionUrl(true),
        files: this.task.submittedFilesUrl(),
      };
    });
  }

  uploadAlternateFiles(): void {
    this.task.presentTaskSubmissionModal(this.task.status, true);
  }

  regeneratePdf(): void {
    this.task.recreateSubmissionPdf().subscribe({
      next: (response: any) => {
        if (response.result === 'false') {
          this.AlertService.add('danger', 'There was an error regenerating the PDF', 6000);
        } else {
          this.task.processingPdf = true;
          this.AlertService.add(
            'success',
            'The PDF is being regenerated. Please refresh the page in a few minutes.',
            6000
          );
        }
      },
      error: (response: any) => {
        this.AlertService.add('danger', 'Request failed, cannot recreate PDF at this time.', 6000);
      },
    });
  }

  downloadSubmission(): void {
    this.fileDownloader.downloadFile(this.urls.pdf, `${this.task.definition.abbreviation}.pdf`);
  }

  downloadSubmissionFiles(): void {
    this.fileDownloader.downloadFile(this.urls.files, `${this.task.definition.abbreviation}.zip`);
  }
}
