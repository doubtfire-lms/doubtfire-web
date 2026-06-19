import JSZip from 'jszip';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {AlertService} from '../services/alert.service';
import {
  ArchiveFileEntry,
  classifyArchiveFile,
  createArchiveFileEntry,
  createArchiveFilePlaceholder,
  getMonacoLanguageForPath,
  getOrderedUploadFileIndex,
  isArchiveCodeOrTextFile,
  isArchiveImageFile,
  isArchivePathHidden,
  isArchivePdfFile,
} from './archive-viewer.helpers';

type ArchiveViewerNavigationMode = 'tabs' | 'tree';

interface ArchiveFileTreeNode {
  key: string;
  name: string;
  path: string;
  isDirectory: boolean;
  fileIndex: number | null;
  children: ArchiveFileTreeNode[];
}

@Component({
  selector: 'f-archive-viewer',
  templateUrl: './archive-viewer.component.html',
  styleUrls: ['./archive-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ArchiveViewerComponent implements OnChanges, OnDestroy {
  @Input() archiveFile: File | Blob | null = null;
  @Input() navigationMode: ArchiveViewerNavigationMode = 'tabs';
  @Input() readOnly = true;
  @Input() uploadRequirementNames: string[] = [];
  @Input() showPreview = true;
  @Input() preloadSelectedFile = false;
  @Input() saveEndpoint?: string;
  @Input() saveMethod: 'POST' | 'PUT' = 'POST';
  @Input() saveFieldName = 'file';
  @Input() saveFileName = 'archive.zip';

  @Output() filesLoaded: EventEmitter<number> = new EventEmitter();
  @Output() saveSuccess: EventEmitter<HttpResponse<unknown>> = new EventEmitter();
  @Output() saveError: EventEmitter<unknown> = new EventEmitter();
  @Output() selectedFileChanged: EventEmitter<ArchiveFileEntry | null> = new EventEmitter();

  public files: ArchiveFileEntry[] = [];
  public selectedTab = 0;
  public isLoading = false;
  public isSaving = false;
  public errorMessage: string | null = null;
  public fileTreeNodes: ArchiveFileTreeNode[] = [];

  public readonly isArchiveCodeOrTextFile = isArchiveCodeOrTextFile;
  public readonly isArchiveImageFile = isArchiveImageFile;
  public readonly isArchivePdfFile = isArchivePdfFile;

  public readonly editorOptions = {
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
      void this.loadArchive();
    }

    if (changes['uploadRequirementNames']) {
      this.applyUploadRequirementLabels(this.files);
      this.rebuildFileTree();
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

  public trackTreeNode(_index: number, node: ArchiveFileTreeNode): string {
    return node.key;
  }

  public selectTreeNode(node: ArchiveFileTreeNode): void {
    if (node.fileIndex === null) {
      return;
    }

    this.selectTab(node.fileIndex);
  }

  public treeNodeLabel(node: ArchiveFileTreeNode): string {
    return node.fileIndex === null ? node.name : this.files[node.fileIndex]?.tabLabel || node.name;
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
      !isArchiveCodeOrTextFile(selectedFile)
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
        if (file.isLoaded && isArchiveCodeOrTextFile(file) && file.textContent !== undefined) {
          const encoded = new TextEncoder().encode(file.textContent);
          file.data = encoded;
          file.originalTextContent = file.textContent;
          zip.file(file.path, encoded);
          continue;
        }

        if (file.data) {
          zip.file(file.path, file.data);
          continue;
        }

        const rawData = await file.zipObject.async('uint8array');
        zip.file(file.path, rawData);
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
    const requestedArchive = this.archiveFile;

    this.errorMessage = null;
    this.selectedTab = 0;
    this.clearFiles();

    if (!requestedArchive) {
      return;
    }

    this.isLoading = true;

    try {
      const zipData = await requestedArchive.arrayBuffer();
      const zip = await JSZip.loadAsync(zipData);
      const paths = Object.keys(zip.files).sort((a, b) => a.localeCompare(b));
      const loadedFiles: ArchiveFileEntry[] = [];

      for (const path of paths) {
        const zipFile = zip.files[path];
        if (!zipFile || zipFile.dir || isArchivePathHidden(path)) {
          continue;
        }

        loadedFiles.push(createArchiveFilePlaceholder(path, zipFile));
      }

      if (requestedArchive !== this.archiveFile) {
        this.revokeUrls(loadedFiles);
        return;
      }

      this.files = loadedFiles;
      this.applyUploadRequirementLabels(this.files);
      this.rebuildFileTree();
      this.filesLoaded.emit(this.files.length);

      if (this.files.length === 0) {
        this.errorMessage = 'This archive does not contain any files.';
        this.selectedFileChanged.emit(null);
        return;
      }

      this.updateEditorOptions();
      if (this.showPreview || this.preloadSelectedFile) {
        void this.loadAndPrepareSelectedFile();
      } else {
        this.selectedFileChanged.emit(null);
      }
    } catch {
      this.errorMessage = 'Unable to read archive. Please provide a valid zip file.';
      this.filesLoaded.emit(0);
    } finally {
      if (requestedArchive === this.archiveFile) {
        this.isLoading = false;
      }
    }
  }

  private clearFiles(): void {
    this.revokeUrls(this.files);
    this.files = [];
    this.fileTreeNodes = [];
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

  private rebuildFileTree(): void {
    const rootNodes: ArchiveFileTreeNode[] = [];

    const getOrCreateNode = (
      siblings: ArchiveFileTreeNode[],
      node: Pick<ArchiveFileTreeNode, 'name' | 'path' | 'isDirectory' | 'fileIndex'>,
    ): ArchiveFileTreeNode => {
      const existing = siblings.find(
        (candidate) =>
          candidate.name === node.name &&
          candidate.path === node.path &&
          candidate.isDirectory === node.isDirectory,
      );
      if (existing) {
        if (!node.isDirectory && node.fileIndex !== null) {
          existing.fileIndex = node.fileIndex;
        }
        return existing;
      }

      const createdNode: ArchiveFileTreeNode = {
        key: `${node.isDirectory ? 'dir' : 'file'}:${node.path}`,
        name: node.name,
        path: node.path,
        isDirectory: node.isDirectory,
        fileIndex: node.fileIndex,
        children: [],
      };
      siblings.push(createdNode);
      return createdNode;
    };

    for (let fileIndex = 0; fileIndex < this.files.length; fileIndex++) {
      const file = this.files[fileIndex];
      const segments = file.path.split('/').filter((segment) => segment.length > 0);
      if (segments.length === 0) {
        continue;
      }

      let currentNodes = rootNodes;
      let currentPath = '';
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const isFile = i === segments.length - 1;
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;

        const node = getOrCreateNode(currentNodes, {
          name: segment,
          path: currentPath,
          isDirectory: !isFile,
          fileIndex: isFile ? fileIndex : null,
        });

        if (!isFile) {
          currentNodes = node.children;
        }
      }
    }

    const sortNodes = (nodes: ArchiveFileTreeNode[]): void => {
      nodes.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      for (const node of nodes) {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      }
    };

    sortNodes(rootNodes);
    this.fileTreeNodes = rootNodes;
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
    } catch {
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

    if (file.blobUrl) {
      URL.revokeObjectURL(file.blobUrl);
    }

    file.blobUrl = URL.createObjectURL(file.blob);
  }

  private updateEditorOptions(): void {
    this.editorOptionsForSelectedFile = {
      ...this.editorOptions,
      language: this.selectedFileLanguage(),
      readOnly: this.readOnly,
    };
  }
}
