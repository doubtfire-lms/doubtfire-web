import { Component, Input, Inject, OnInit } from '@angular/core';
import { gradeService, Task, taskService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-submission-card',
  templateUrl: 'task-submission-card.component.html',
  styleUrls: ['task-submission-card.component.scss'],
})
export class TaskSubmissionnCardComponent implements OnInit {
  @Input() task: any;

  submission_date: String;
  public canReuploadEvidence: any;
  public canRegeneratePdf: any;
  submission = {};
  urls = { pdf: '', files: '' };

  constructor(@Inject(Task) private taskAPI: any, @Inject(taskService) private ts: any) {}
  ngOnInit(): void {
    this.canReuploadEvidence = this.task.canReuploadEvidence();
    this.task.getSubmissionDetails((details) => {
      this.canRegeneratePdf = this.ts.pdfRegeneratableStatuses.includes(details.status) && details.has_pdf;
      this.submission = {
        isProcessing: details.processing_pdf,
        isUploaded: details.has_pdf,
      };
      this.urls = {
        pdf: this.taskAPI.getTaskUrl(this.task, true),
        files: this.taskAPI.getTaskFilesUrl(this.task),
      };
    });
  }

  public uploadAlternateFiles() {
    this.ts.presentTaskSubmissionModal(this.task, this.task.status, true);
  }

  public regeneratePdf() {
    this.task.recreateSubmissionPdf();
  }
}
