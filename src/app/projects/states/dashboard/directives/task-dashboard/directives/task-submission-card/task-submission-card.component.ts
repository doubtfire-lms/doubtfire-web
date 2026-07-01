import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-task-submission-card',
  templateUrl: './task-submission-card.component.html',
  styleUrls: ['./task-submission-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskSubmissionCardComponent implements OnChanges, OnInit {
  @Input() task: Task;

  public get canRegeneratePdf(): boolean {
    return (
      this.taskService.pdfRegeneratableStatuses.includes(this.task?.status) && this.task?.hasPdf
    );
  }

  public get taskPdfUrl(): string {
    return this.task?.submissionUrl(true);
  }

  public get taskFilesUrl(): string {
    return this.task?.submittedFilesUrl();
  }

  constructor(
    private taskService: TaskService,
    private alerts: AlertService,
    private fileDownloader: FileDownloaderService,
  ) {}

  ngOnInit(): void {
    if (this.task) {
      this.reapplySubmissionData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.task) {
      this.reapplySubmissionData();
    }
  }

  reapplySubmissionData(): void {
    this.task.getSubmissionDetails().subscribe();
  }

  uploadAlternateFiles(): void {
    this.task.presentTaskSubmissionModal(this.task.status, true);
  }

  regeneratePdf(): void {
    this.task.recreateSubmissionPdf().subscribe({
      next: (response: {result: string}) => {
        if (response.result === 'false') {
          this.alerts.error('There was an error regenerating the PDF', 6000);
        } else {
          this.task.processingPdf = true;
          this.alerts.success(
            'The PDF is being regenerated. Please refresh the page in a few minutes.',
            6000,
          );
        }
      },
      error: (_response: Error) => {
        this.alerts.error('Request failed, cannot recreate PDF at this time.', 6000);
      },
    });
  }

  downloadSubmission(): void {
    this.fileDownloader.downloadFile(this.taskPdfUrl, `${this.task.definition.abbreviation}.pdf`);
  }

  downloadSubmissionFiles(): void {
    this.fileDownloader.downloadFile(this.taskFilesUrl, `${this.task.definition.abbreviation}.zip`);
  }
}
