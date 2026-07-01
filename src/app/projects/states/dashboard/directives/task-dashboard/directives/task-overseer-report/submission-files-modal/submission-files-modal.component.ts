import * as monaco from 'monaco-editor';
import {HttpResponse} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SubmissionArchive} from 'src/app/api/models/submission-history';
import {
  ArchiveFileEntry,
  isArchiveCodeOrTextFile,
  isArchiveImageFile,
  isArchivePdfFile,
} from 'src/app/common/archive-viewer/archive-viewer.helpers';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AlertService} from 'src/app/common/services/alert.service';

export interface SubmissionFilesModalData {
  assessment: SubmissionArchive;
  assessmentNumber?: number;
  assessmentIsMostRecent?: boolean;
  comparedWith?: SubmissionArchive;
  comparedWithNumber?: number;
  comparedWithIsMostRecent?: boolean;
}

@Component({
  selector: 'f-submission-files-modal',
  templateUrl: './submission-files-modal.component.html',
  styleUrls: ['./submission-files-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionFilesModalComponent implements OnInit, OnDestroy {
  private readonly diffOriginalUri = monaco.Uri.parse('inmemory://submission-compare/original');
  private readonly diffModifiedUri = monaco.Uri.parse('inmemory://submission-compare/modified');
  public readonly isArchiveCodeOrTextFile = isArchiveCodeOrTextFile;
  public readonly isArchiveImageFile = isArchiveImageFile;
  public readonly isArchivePdfFile = isArchivePdfFile;

  public archiveBlob: Blob | null = null;
  public comparedArchiveBlob: Blob | null = null;
  public isLoading = true;
  public uploadRequirementNames: string[] = [];
  public errorMessage: string | null = null;
  public primarySelectedFile: ArchiveFileEntry | null = null;
  public comparedSelectedFile: ArchiveFileEntry | null = null;
  public primaryArchiveParsed = false;
  public comparedArchiveParsed = false;
  public selectedFilesMatch: boolean | null = null;
  private selectedFilesComparisonToken = 0;

  public diffEditorOptions = {
    theme: 'vs',
    language: 'plaintext',
    renderMinimap: false,
    readOnly: true,
    domReadOnly: true,
    renderMarginRevertIcon: false,
    enableSplitViewResizing: false,
    useInlineViewWhenSpaceIsLimited: false,
    renderSideBySideInlineBreakpoint: 1000,
    renderSideBySide: true,
    compactMode: false,
    minimap: {
      enabled: false,
    },
    lineNumbers: 'off',
    automaticLayout: true,
  };
  public singleEditorOptions = {
    theme: 'vs',
    language: 'plaintext',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    renderMinimap: false,
    readOnly: true,
    minimap: {
      enabled: false,
    },
  };
  public primarySingleEditorOptions = {...this.singleEditorOptions};
  public comparedSingleEditorOptions = {...this.singleEditorOptions};
  public diffOriginalModel: {language: string; code: string; uri: monaco.Uri} = {
    language: 'plaintext',
    code: '',
    uri: this.diffOriginalUri,
  };
  public diffModifiedModel: {language: string; code: string; uri: monaco.Uri} = {
    language: 'plaintext',
    code: '',
    uri: this.diffModifiedUri,
  };

  constructor(
    private fileDownloader: FileDownloaderService,
    private alerts: AlertService,
    public dialogRef: MatDialogRef<SubmissionFilesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubmissionFilesModalData,
  ) {}

  public get compareMode(): boolean {
    return !!this.data.comparedWith;
  }

  public get bothSelectionsReady(): boolean {
    return !!this.primarySelectedFile && !!this.comparedSelectedFile;
  }

  public get canShowDiffEditor(): boolean {
    return (
      this.bothSelectionsReady &&
      isArchiveCodeOrTextFile(this.primarySelectedFile) &&
      isArchiveCodeOrTextFile(this.comparedSelectedFile)
    );
  }

  ngOnInit(): void {
    this.uploadRequirementNames =
      this.data.assessment.task?.definition?.uploadRequirements?.map(
        (requirement) => requirement?.name?.trim() ?? '',
      ) ?? [];

    void this.loadSubmissionArchives();
  }

  ngOnDestroy(): void {
    monaco.editor.getModel(this.diffOriginalUri)?.dispose();
    monaco.editor.getModel(this.diffModifiedUri)?.dispose();
  }

  private async loadSubmissionArchives(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    this.primaryArchiveParsed = false;
    this.comparedArchiveParsed = false;
    this.primarySelectedFile = null;
    this.comparedSelectedFile = null;
    this.selectedFilesMatch = null;
    this.resetDiffModels();
    this.resetSingleEditorOptions();

    try {
      if (this.data.comparedWith) {
        this.archiveBlob = await this.downloadSubmissionArchive(this.data.assessment);
        this.comparedArchiveBlob = await this.downloadSubmissionArchive(this.data.comparedWith);
      } else {
        this.archiveBlob = await this.downloadSubmissionArchive(this.data.assessment);
      }
    } catch (error) {
      this.errorMessage = `Failed to load submission files: ${error}`;
      this.alerts.error(this.errorMessage, 6000);
    } finally {
      this.isLoading = false;
    }
  }

  private downloadSubmissionArchive(assessment: SubmissionArchive): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.fileDownloader.downloadBlob(
        assessment.submissionFilesUrl(),
        (_resourceUrl: string, response: HttpResponse<Blob>) => {
          if (!response.body) {
            reject('No submission archive returned.');
            return;
          }
          resolve(response.body);
        },
        (error) => {
          reject(error?.error?.error ?? error);
        },
      );
    });
  }

  public onPrimarySelectionChange(file: ArchiveFileEntry | null): void {
    this.applySelectionChange(file, (value) => {
      this.primarySelectedFile = value;
    });
  }

  public onComparedSelectionChange(file: ArchiveFileEntry | null): void {
    this.applySelectionChange(file, (value) => {
      this.comparedSelectedFile = value;
    });
  }

  private applySelectionChange(
    file: ArchiveFileEntry | null,
    assignSelection: (value: ArchiveFileEntry | null) => void,
  ): void {
    if (file && !file.isLoaded) {
      return;
    }
    assignSelection(file);
    this.refreshSingleEditorOptions();
    this.refreshDiffModels();
    void this.refreshSelectedFilesMatch();
  }

  public onPrimaryFilesLoaded(): void {
    this.primaryArchiveParsed = true;
  }

  public onComparedFilesLoaded(): void {
    this.comparedArchiveParsed = true;
  }

  private resetDiffModels(): void {
    this.diffOriginalModel = {language: 'plaintext', code: '', uri: this.diffOriginalUri};
    this.diffModifiedModel = {language: 'plaintext', code: '', uri: this.diffModifiedUri};
  }

  private refreshDiffModels(): void {
    if (!this.canShowDiffEditor) {
      this.resetDiffModels();
      return;
    }

    this.diffOriginalModel = {
      language: this.primarySelectedFile?.language ?? 'plaintext',
      code: this.primarySelectedFile?.textContent ?? '',
      uri: this.diffOriginalUri,
    };
    this.diffModifiedModel = {
      language: this.comparedSelectedFile?.language ?? 'plaintext',
      code: this.comparedSelectedFile?.textContent ?? '',
      uri: this.diffModifiedUri,
    };
  }

  private resetSingleEditorOptions(): void {
    this.primarySingleEditorOptions = {...this.singleEditorOptions, language: 'plaintext'};
    this.comparedSingleEditorOptions = {...this.singleEditorOptions, language: 'plaintext'};
  }

  private refreshSingleEditorOptions(): void {
    this.primarySingleEditorOptions = {
      ...this.singleEditorOptions,
      language: this.primarySelectedFile?.language ?? 'plaintext',
    };
    this.comparedSingleEditorOptions = {
      ...this.singleEditorOptions,
      language: this.comparedSelectedFile?.language ?? 'plaintext',
    };
  }

  private async refreshSelectedFilesMatch(): Promise<void> {
    const token = ++this.selectedFilesComparisonToken;
    if (!this.primarySelectedFile || !this.comparedSelectedFile) {
      this.selectedFilesMatch = null;
      return;
    }

    const [primaryHash, comparedHash] = await Promise.all([
      this.computeFileHash(this.primarySelectedFile),
      this.computeFileHash(this.comparedSelectedFile),
    ]);

    if (token !== this.selectedFilesComparisonToken) {
      return;
    }

    this.selectedFilesMatch = primaryHash === comparedHash;
  }

  private async computeFileHash(file: ArchiveFileEntry): Promise<string> {
    let bytes: Uint8Array | null = file.data ?? null;
    if (!bytes && file.textContent !== undefined) {
      bytes = new TextEncoder().encode(file.textContent);
    }
    if (!bytes && file.blob) {
      bytes = new Uint8Array(await file.blob.arrayBuffer());
    }
    if (!bytes) {
      return '';
    }

    const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
    return Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('');
  }
}
