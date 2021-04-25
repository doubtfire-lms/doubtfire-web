import { Component, Input, Inject} from '@angular/core';
import { taskFeedbackService, taskService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-submission-card',
  templateUrl: 'task-submission-card.component.html',
  styleUrls: ['task-submission-card.component.scss']
})
export class TaskSubmissionCardComponent {
  @Input() task: any;

  submission_date: String;
  public canReuploadEvidence: boolean;
  public canRegeneratePdf: boolean;
  submission = {
    isProcessing: false,
    isUploaded: false,
  };
  currentTask: any;
  urls = { pdf: '', files: '' };

  public reapplySubmissionData(){
    this.task.getSubmissionDetails(()=>{
      this.canReuploadEvidence = this.task.canReuploadEvidence();
      this.canRegeneratePdf = this.ts.pdfRegeneratableStatuses.includes(this.task.status) && this.task.has_pdf;
      console.log(this.task)
  
      this.submission = {
        isProcessing: this.task.processing_pdf,
        isUploaded: this.task.has_pdf,
      };      
      console.log(this.submission)
      this.urls = {
        pdf: this.taskFeedbackService.getTaskUrl(this.task, true),
        files: this.taskFeedbackService.getTaskFilesUrl(this.task),
      };
    })
  }

  constructor(@Inject(taskFeedbackService) private taskFeedbackService: any, @Inject(taskService) private ts: any) {}
  ngDoCheck() {
    if (this.currentTask != this.task) {
      this.currentTask = this.task;
      this.reapplySubmissionData()
    }
  }
  public uploadAlternateFiles() {
    this.ts.presentTaskSubmissionModal(this.task, this.task.status, true);
  }

  public regeneratePdf() {
    this.task.recreateSubmissionPdf();
  }

  public download(url) {
    console.log(url)
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', url);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

