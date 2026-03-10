import {HttpResponse} from '@angular/common/http';
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {OverseerAssessment} from 'src/app/api/models/doubtfire-model';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AlertService} from 'src/app/common/services/alert.service';

export interface SubmissionFilesModalData {
  assessment: OverseerAssessment;
  title?: string;
}

@Component({
  selector: 'f-submission-files-modal',
  templateUrl: './submission-files-modal.component.html',
  styleUrls: ['./submission-files-modal.component.scss'],
})
export class SubmissionFilesModalComponent implements OnInit {
  public archiveBlob: Blob | null = null;
  public isLoading = true;

  constructor(
    private fileDownloader: FileDownloaderService,
    private alerts: AlertService,
    public dialogRef: MatDialogRef<SubmissionFilesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubmissionFilesModalData,
  ) {}

  ngOnInit(): void {
    this.fileDownloader.downloadBlob(
      this.data.assessment.submissionFilesUrl(),
      (resourceUrl: string, response: HttpResponse<Blob>) => {
        this.archiveBlob = response.body;
        // this.fileDownloader.releaseBlob(resourceUrl);
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.alerts.error(`Failed to load submission files: ${error?.error?.error ?? error}`, 6000);
      },
    );
  }
}
