import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';

/**
 * Shows the files of a task's latest submission, one tab per file.
 *
 * Downloads the submission zip and hands it to the archive viewer, which
 * renders PDFs, images and code files.
 */
@Component({
  selector: 'f-task-file-viewer',
  templateUrl: './task-file-viewer.component.html',
  host: {'class': 'block size-full'},
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskFileViewerComponent implements OnChanges {
  @Input() task: Task;

  public archiveBlob: Blob | null = null;
  public isLoading = false;
  public hasNoFiles = false;
  public errorMessage: string | null = null;
  public uploadRequirementNames: string[] = [];

  // Identifies the latest request, so a slow download for a previous task is ignored.
  private loadToken = 0;

  constructor(private fileDownloader: FileDownloaderService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']) {
      void this.loadSubmissionFiles();
    }
  }

  private async loadSubmissionFiles(): Promise<void> {
    const token = ++this.loadToken;
    const task = this.task;

    this.archiveBlob = null;
    this.hasNoFiles = false;
    this.errorMessage = null;
    this.uploadRequirementNames =
      task?.definition?.uploadRequirements?.map((requirement) => requirement?.name?.trim() ?? '') ??
      [];

    if (!task) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    try {
      const blob = await this.downloadArchive(task.submittedFilesUrl());
      const isZip = await this.isZipArchive(blob);
      if (token !== this.loadToken) {
        return;
      }

      // The API returns a placeholder PDF when the task has no stored submission zip.
      if (isZip) {
        this.archiveBlob = blob;
      } else {
        this.hasNoFiles = true;
      }
    } catch {
      if (token === this.loadToken) {
        this.errorMessage = 'Unable to load the submitted files.';
      }
    } finally {
      if (token === this.loadToken) {
        this.isLoading = false;
      }
    }
  }

  private downloadArchive(url: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.fileDownloader.downloadBlob(
        url,
        (resourceUrl: string) => {
          // Read the assembled blob url rather than the response body, as large
          // files arrive in parts and the body only holds the last part.
          fetch(resourceUrl)
            .then((response) => response.blob())
            .then(resolve, reject)
            .finally(() => URL.revokeObjectURL(resourceUrl));
        },
        (error) => reject(error),
      );
    });
  }

  private async isZipArchive(blob: Blob): Promise<boolean> {
    const signature = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
    return signature.length === 2 && signature[0] === 0x50 && signature[1] === 0x4b;
  }
}
