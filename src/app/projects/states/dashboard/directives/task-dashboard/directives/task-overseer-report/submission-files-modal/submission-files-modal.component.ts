import {HttpResponse} from '@angular/common/http';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import * as monaco from 'monaco-editor';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {OverseerAssessment} from 'src/app/api/models/doubtfire-model';
import {ArchiveFileEntry} from 'src/app/common/archive-viewer/archive-viewer.helpers';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AlertService} from 'src/app/common/services/alert.service';

export interface SubmissionFilesModalData {
  assessment: OverseerAssessment;
  comparedWith?: OverseerAssessment;
}

@Component({
  selector: 'f-submission-files-modal',
  templateUrl: './submission-files-modal.component.html',
  styleUrls: ['./submission-files-modal.component.scss'],
})
export class SubmissionFilesModalComponent implements OnInit, OnDestroy {
  private readonly diffOriginalUri = monaco.Uri.parse('inmemory://submission-compare/original');
  private readonly diffModifiedUri = monaco.Uri.parse('inmemory://submission-compare/modified');

  public archiveBlob: Blob | null = null;
  public comparedArchiveBlob: Blob | null = null;
  public isLoading = true;
  public uploadRequirementNames: string[] = [];
  public errorMessage: string | null = null;
  public primarySelectedFile: ArchiveFileEntry | null = null;
  public comparedSelectedFile: ArchiveFileEntry | null = null;
  public primaryArchiveParsed = false;
  public comparedArchiveParsed = false;

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
      this.isCodeOrText(this.primarySelectedFile) &&
      this.isCodeOrText(this.comparedSelectedFile)
    );
  }

  ngOnInit(): void {
    this.uploadRequirementNames =
      this.data.assessment.task?.definition?.uploadRequirements
        ?.map((requirement) => requirement?.name?.trim() ?? '') ?? [];

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

  private downloadSubmissionArchive(assessment: OverseerAssessment): Promise<Blob> {
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
    if (file && !file.isLoaded) {
      return;
    }
    this.primarySelectedFile = file;
    this.refreshSingleEditorOptions();
    this.refreshDiffModels();
  }

  public onComparedSelectionChange(file: ArchiveFileEntry | null): void {
    if (file && !file.isLoaded) {
      return;
    }
    this.comparedSelectedFile = file;
    this.refreshSingleEditorOptions();
    this.refreshDiffModels();
  }

  public onPrimaryFilesLoaded(): void {
    this.primaryArchiveParsed = true;
  }

  public onComparedFilesLoaded(): void {
    this.comparedArchiveParsed = true;
  }

  public isCodeOrText(file: ArchiveFileEntry | null): boolean {
    return file?.kind === 'code' || file?.kind === 'text';
  }

  public isPdf(file: ArchiveFileEntry | null): boolean {
    return file?.kind === 'pdf' && !!file.blobUrl;
  }

  public isImage(file: ArchiveFileEntry | null): boolean {
    return file?.kind === 'image' && !!file.blobUrl;
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
}
