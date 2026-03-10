import {HttpClient, HttpResponse} from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import JSZip from 'jszip';
import {firstValueFrom} from 'rxjs';
import {AlertService} from '../services/alert.service';
import {
  ArchiveFileEntry,
  classifyArchiveFile,
  createArchiveFileEntry,
  createArchiveFilePlaceholder,
  getMonacoLanguageForPath,
  getOrderedUploadFileIndex,
} from './archive-viewer.helpers';

@Component({
  selector: 'f-archive-viewer',
  templateUrl: './archive-viewer.component.html',
  styleUrls: ['./archive-viewer.component.scss'],
})
export class ArchiveViewerComponent implements OnChanges, OnDestroy {
  @Input() archiveFile: File | Blob | null = null;
  @Input() readOnly = true;
  @Input() uploadRequirementNames: string[] = [];
  @Input() showPreview = true;
  @Input() preloadSelectedFile = false;
  @Input() saveEndpoint?: string;
  @Input() saveMethod: 'POST' | 'PUT' = 'POST';
  @Input() saveFieldName = 'file';
  @Input() saveFileName = 'archive.zip';

  @Output() filesLoaded = new EventEmitter<number>();
  @Output() saveSuccess = new EventEmitter<HttpResponse<unknown>>();
  @Output() saveError = new EventEmitter<unknown>();
  @Output() selectedFileChanged = new EventEmitter<ArchiveFileEntry | null>();

  public files: ArchiveFileEntry[] = [];
  public selectedTab = 0;
  public isLoading = false;
  public isSaving = false;
  public errorMessage: string | null = null;

  private loadToken = 0;

  public editorOptions = {
    theme: 'vs',
    language: 'plaintext',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    renderMinimap: false,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
    minimap: {
      enabled: false,
    },
  };
  public editorOptionsForSelectedFile = {
    ...this.editorOptions,
    language: 'plaintext',
    readOnly: true,
  };

  constructor(
    private http: HttpClient,
    private alerts: AlertService,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['archiveFile']) {
      this.loadArchive();
    }
    if (changes['uploadRequirementNames']) {
      this.applyUploadRequirementLabels(this.files);
    }
    if (changes['readOnly']) {
      this.updateEditorOptions();
    }
  }

  public ngOnDestroy(): void {
    this.clearFiles();
  }

  public get selectedFile(): ArchiveFileEntry | null {
    return this.files[this.selectedTab] ?? null;
  }

  public get hasFiles(): boolean {
    return this.files.length > 0;
  }

  public get hasDirtyFiles(): boolean {
    return this.files.some((entry) => entry.dirty);
  }

  public get canSave(): boolean {
    return !this.readOnly && !!this.saveEndpoint && this.hasDirtyFiles && !this.isSaving;
  }

  public trackByPath(index: number, file: ArchiveFileEntry): string {
    return `${index}-${file.path}`;
  }

  public selectTab(index: number): void {
    this.selectedTab = index;
    this.updateEditorOptions();
    void this.loadAndPrepareSelectedFile();
  }

  public selectedFileLanguage(): string {
    const selectedFile = this.selectedFile;
    if (!selectedFile) {
      return 'plaintext';
    }

    return selectedFile.language ?? getMonacoLanguageForPath(selectedFile.path) ?? 'plaintext';
  }

  public onEditorChange(value: string): void {
    const selectedFile = this.selectedFile;
    if (
      !selectedFile ||
      !selectedFile.isLoaded ||
      this.readOnly ||
      (selectedFile.kind !== 'code' && selectedFile.kind !== 'text')
    ) {
      return;
    }

    selectedFile.textContent = value;
    selectedFile.dirty = selectedFile.textContent !== selectedFile.originalTextContent;
  }

  public async downloadSelectedFile(): Promise<void> {
    const file = this.selectedFile;
    await this.ensureFileLoaded(file);
    if (!file?.blobUrl) {
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = file.blobUrl;
    downloadLink.download = file.name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.parentNode?.removeChild(downloadLink);
  }

  public async saveArchive(): Promise<void> {
    if (!this.canSave || !this.saveEndpoint) {
      return;
    }

    this.isSaving = true;

    try {
      const zip = new JSZip();

      for (const file of this.files) {
        if (
          file.isLoaded &&
          (file.kind === 'code' || file.kind === 'text') &&
          file.textContent !== undefined
        ) {
          const encoded = new TextEncoder().encode(file.textContent);
          file.data = encoded;
          file.originalTextContent = file.textContent;
          zip.file(file.path, encoded);
        } else if (file.data) {
          zip.file(file.path, file.data);
        } else {
          const rawData = await file.zipObject.async('uint8array');
          zip.file(file.path, rawData);
        }
      }

      const archiveBlob = await zip.generateAsync({type: 'blob'});
      const archiveUpload = new File([archiveBlob], this.saveFileName, {type: 'application/zip'});
      const formData = new FormData();
      formData.append(this.saveFieldName, archiveUpload);

      const request =
        this.saveMethod === 'PUT'
          ? this.http.put<unknown>(this.saveEndpoint, formData, {observe: 'response'})
          : this.http.post<unknown>(this.saveEndpoint, formData, {observe: 'response'});

      const response = await firstValueFrom(request);
      for (const file of this.files) {
        file.dirty = false;
      }
      this.alerts.success('Archive saved', 3000);
      this.saveSuccess.emit(response);
    } catch (error) {
      this.alerts.error(`Failed to save archive: ${error}`, 6000);
      this.saveError.emit(error);
    } finally {
      this.isSaving = false;
    }
  }

  private async loadArchive(): Promise<void> {
    const token = ++this.loadToken;
    this.errorMessage = null;
    this.selectedTab = 0;
    this.clearFiles();

    if (!this.archiveFile) {
      return;
    }

    this.isLoading = true;

    try {
      const zipData = await this.archiveFile.arrayBuffer();
      const zip = await JSZip.loadAsync(zipData);
      const paths = Object.keys(zip.files).sort((a, b) => a.localeCompare(b));
      const loadedFiles: ArchiveFileEntry[] = [];

      for (const path of paths) {
        const zipFile = zip.files[path];
        if (!zipFile || zipFile.dir) {
          continue;
        }

        loadedFiles.push(createArchiveFilePlaceholder(path, zipFile));
      }

      if (token !== this.loadToken) {
        this.revokeUrls(loadedFiles);
        return;
      }

      this.files = loadedFiles;
      this.applyUploadRequirementLabels(this.files);
      this.filesLoaded.emit(this.files.length);
      if (this.files.length === 0) {
        this.errorMessage = 'This archive does not contain any files.';
        this.selectedFileChanged.emit(null);
      } else {
        this.updateEditorOptions();
        if (this.showPreview || this.preloadSelectedFile) {
          void this.loadAndPrepareSelectedFile();
        } else {
          this.selectedFileChanged.emit(null);
        }
      }
    } catch (_error) {
      this.errorMessage = 'Unable to read archive. Please provide a valid zip file.';
      this.filesLoaded.emit(0);
    } finally {
      if (token === this.loadToken) {
        this.isLoading = false;
      }
    }
  }

  private clearFiles(): void {
    this.revokeUrls(this.files);
    this.files = [];
    this.selectedFileChanged.emit(null);
  }

  private applyUploadRequirementLabels(files: ArchiveFileEntry[]): void {
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex];
      const orderedIndex = getOrderedUploadFileIndex(file.path);
      const requirementIndex = orderedIndex ?? fileIndex;
      const requirementName = this.uploadRequirementNames[requirementIndex];
      file.tabLabel = requirementName?.trim() || file.name;
    }
  }

  private revokeUrls(files: ArchiveFileEntry[]): void {
    for (const file of files) {
      if (file.blobUrl) {
        URL.revokeObjectURL(file.blobUrl);
      }
    }
  }

  private async ensureFileLoaded(file: ArchiveFileEntry | null): Promise<void> {
    if (!file || file.isLoaded || file.isLoading) {
      return;
    }

    file.isLoading = true;
    try {
      const data = await file.zipObject.async('uint8array');
      const classification = classifyArchiveFile(file.path, data);
      const enriched = createArchiveFileEntry(file, classification, data);
      Object.assign(file, enriched);
      if (file === this.selectedFile) {
        this.updateEditorOptions();
      }
    } catch (_error) {
      file.isLoading = false;
      this.alerts.error(`Unable to open file '${file.path}' from archive`, 6000);
    }
  }

  private async loadAndPrepareSelectedFile(): Promise<void> {
    const file = this.selectedFile;
    await this.ensureFileLoaded(file);
    if (!file || file !== this.selectedFile || !file.isLoaded) {
      this.selectedFileChanged.emit(null);
      return;
    }
    this.prepareFileForDisplay(file);
    this.selectedFileChanged.emit(file);
  }

  private prepareFileForDisplay(file: ArchiveFileEntry): void {
    if (file.kind !== 'pdf' || !file.blob) {
      return;
    }

    this.normalizePdfViewerZoom();
    if (file.blobUrl) {
      URL.revokeObjectURL(file.blobUrl);
    }
    file.blobUrl = URL.createObjectURL(file.blob);
  }

  private normalizePdfViewerZoom(): void {
    try {
      const current = localStorage.getItem('pdfViewerZoom');
      if (current !== '1') {
        localStorage.setItem('pdfViewerZoom', '1');
      }
    } catch {
      // Ignore storage access errors.
    }
  }

  private updateEditorOptions(): void {
    this.editorOptionsForSelectedFile = {
      ...this.editorOptions,
      language: this.selectedFileLanguage(),
      readOnly: this.readOnly,
    };
  }
}
