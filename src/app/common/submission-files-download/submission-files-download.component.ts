import {HttpResponse} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';

type DownloadState = 'downloading' | 'downloaded' | 'failed';

@Component({
  selector: 'f-submission-files-download',
  templateUrl: './submission-files-download.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionFilesDownloadComponent implements OnInit {
  protected downloadState: DownloadState = 'downloading';
  private downloadUrl = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly constants: DoubtfireConstants,
    private readonly fileDownloader: FileDownloaderService,
  ) {}

  public ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    const taskDefId = this.route.snapshot.paramMap.get('taskDefId');

    this.downloadUrl = `${this.constants.API_URL}/projects/${projectId}/task_def_id/${taskDefId}/submission_files?as_attachment=true`;
    this.download();
  }

  protected download(): void {
    this.downloadState = 'downloading';

    this.fileDownloader.downloadBlob(
      this.downloadUrl,
      (resourceUrl: string, response: HttpResponse<Blob>) => {
        this.fileDownloader.downloadBlobToFile(
          resourceUrl,
          this.filenameFromResponse(response) ?? 'submitted-files.zip',
        );
        this.downloadState = 'downloaded';
      },
      () => {
        this.downloadState = 'failed';
      },
    );
  }

  private filenameFromResponse(response: HttpResponse<Blob>): string | null {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(response.headers.get('Content-Disposition'));

    return matches?.[1]?.replace(/['"]/g, '') ?? null;
  }
}
