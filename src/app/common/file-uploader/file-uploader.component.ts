import {HttpClient, HttpErrorResponse, HttpEventType, HttpResponse} from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

export interface FileData {
  name: string;
  type: string;
}

export type FileUploadSpec = FileData[] | Record<string, FileData>;

interface UploadDisplay {
  name: string;
  icon: string;
  type: string;
  error: boolean;
}
interface UploadZone {
  name: string;
  model: File[];
  accept: string;
  accepts: string[];
  rejects: string[];
  display: UploadDisplay;
}

interface UploadingInfo {
  progress: number;
  success: boolean;
  error: string;
  complete: boolean;
}

export const ACCEPTED_TYPES = {
  document: {
    extensions: ['pdf', 'ps', 'docx'],
    // icon: 'picture_as_pdf',
    icon: 'article_outlined',
    name: 'PDF',
  },
  csv: {
    extensions: ['csv', 'xls', 'xlsx'],
    icon: 'insert_chart_outlined',
    name: 'CSV',
  },
  code: {
    // prettier-ignore
    extensions: [
      'pas', 'cpp', 'c', 'cs', 'csv', 'h', 'hpp', 'java', 'py', 'js', 'html', 'coffee', 'rb', 'css',
      'scss', 'yaml', 'yml', 'xml', 'json', 'ts', 'r', 'rmd', 'rnw', 'rhtml', 'rpres', 'tex',
      'vb', 'sql', 'txt', 'md', 'jack', 'hack', 'asm', 'hdl', 'tst', 'out', 'cmp', 'vm', 'sh', 'bat',
      'dat', 'ipynb', 'pml', 'vue'
    ],
    // icon: 'code',
    // icon: 'code',
    icon: 'integration_instructions_outlined',
    name: 'code',
  },
  image: {
    extensions: ['png', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg', 'gif'],
    // icon: 'image',
    icon: 'image_outlined',
    name: 'image',
  },
  zip: {
    extensions: ['zip', 'tar.gz', 'tgz', 'tar'],
    icon: 'folder_zip',
    name: 'zip',
  },
} as const;

@Component({
  selector: 'f-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FileUploaderComponent implements OnInit, OnChanges {
  @Input() files: FileUploadSpec;
  @Input() url: string;
  @Input() method = 'POST';
  @Input() payload?: unknown;

  @Input() onBeforeUpload?: () => void;
  @Input() onSuccess?: (response) => void;
  @Input() onFailure?: (response) => void;
  @Input() onComplete?: () => void;
  @Input() onClickFailureCancel?: () => void;

  @Input() isUploading: boolean;
  @Input() isReady: boolean;
  @Input() showName: boolean = true;
  @Input() asButton: boolean = false;
  @Input() singleDropZone: boolean = false;
  @Input() showUploadButton: boolean = true;
  @Input() resetAfterUpload: boolean = true;

  @Input() initiateUpload?: () => void;

  // HACK: workaround for TypeScript -> Coffeescript communication
  // Once all parent components such as upload-submission-modal are migrated..
  // .. these *wont* be necessary anymore
  // Parent components should declare the file-uploader using @ViewChild() and directly call initiateUpload()
  @Output() isReadyChange: EventEmitter<boolean> = new EventEmitter();
  @Output() uploadReady: EventEmitter<() => void> = new EventEmitter();

  public readonly ACCEPTED_TYPES = ACCEPTED_TYPES;

  public showUploader: boolean = false;
  public uploadingInfo: UploadingInfo = null;

  public shownUploadZones: UploadZone[] = [];
  public uploadZones: UploadZone[] = [];
  public dropSupported: boolean = true;

  constructor(
    private httpClient: HttpClient,
    private constants: DoubtfireConstants,
  ) {}

  private externalName: string = 'OnTrack';

  ngOnInit(): void {
    this.showUploader = !this.asButton;
    this.createUploadZones(this.files);

    this.uploadReady.emit(this.initiateUploadInternal.bind(this));

    if (!this.onClickFailureCancel) {
      this.onClickFailureCancel = this.resetUploader;
    }

    this.resetUploader();

    this.constants.ExternalName.subscribe((name) => {
      this.externalName = name;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['files']) {
      this.createUploadZones(changes.files.currentValue);
      this.updateReadyState(this.readyToUpload());
    }
  }

  public backToUpload() {
    this.isUploading = false;
    this.uploadingInfo = null;
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  public onFileDropped(event: DragEvent, upload: UploadZone) {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.setUploadFile(upload, file);
    }
  }

  public onFileSelected(event: Event, upload: UploadZone) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.setUploadFile(upload, file);
    }
    input.value = '';
  }

  private setUploadFile(upload: UploadZone, file: File) {
    upload.model = [file];
    this.validateFiles();
  }

  validateFiles() {
    for (const upload of this.shownUploadZones) {
      if (upload.model?.length) {
        const name: string = upload.model[0].name.toLowerCase();
        const accepts: string[] = upload.accepts.map((ext: string) => ext.toLowerCase());
        const valid = accepts.some((ext) => name.endsWith(ext));
        if (!valid) {
          upload.model = null;
          upload.display.error = true;
          setTimeout(() => {
            upload.display.error = null;
          }, 5000);
        }
      }
    }
    this.refreshShownUploadZones();
    this.updateReadyState(this.readyToUpload());
  }

  clearEnqueuedUpload(upload: UploadZone) {
    upload.model = null;
    this.refreshShownUploadZones();
    this.updateReadyState(this.readyToUpload());
  }

  readyToUpload(): boolean {
    return this.uploadZones.every((zone) => zone.model?.length);
  }

  updateReadyState(ready: boolean) {
    this.isReady = ready;
    this.isReadyChange.emit(ready);
  }

  resetUploader() {
    this.uploadingInfo = null;
    this.isUploading = false;
    this.showUploader = !this.asButton;
    for (const upload of this.uploadZones) {
      upload.model = null;
    }
    this.refreshShownUploadZones();
    this.updateReadyState(this.readyToUpload());
  }

  initiateUploadInternal() {
    if (!this.readyToUpload()) {
      return;
    }
    if (this.onBeforeUpload) {
      this.onBeforeUpload();
    }

    this.uploadingInfo = {
      progress: 5,
      success: null,
      error: null,
      complete: false,
    };

    this.isUploading = true;

    const form = new FormData();

    // Append files
    for (const zone of this.uploadZones) {
      if (zone.model?.length) {
        form.append(zone.name, zone.model[0]);
      }
    }

    // Append payload
    if (this.payload) {
      for (const [key, value] of Object.entries(this.payload)) {
        let v = value;
        if (typeof v === 'object') {
          v = JSON.stringify(v);
        }
        form.append(key, v);
      }
    }

    this.httpClient
      .request(this.method ?? 'POST', this.url, {
        body: form,
        observe: 'events',
        reportProgress: true,
        responseType: 'text',
      })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadingInfo.progress = Math.floor((event.loaded / event.total) * 100);
          } else if (event instanceof HttpResponse) {
            this.handleUploadResponse(event.status, event.body);
          }
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            this.handleUploadResponse(error.status, error.error);
          } else {
            // Interceptors may propagate an extracted API error rather than the
            // original HttpErrorResponse.
            this.handleUploadResponse(-1, error);
          }
        },
      });
  }

  private handleUploadResponse(status: number, responseBody: unknown): void {
    setTimeout(() => {
      this.uploadingInfo.complete = true;
      const response = this.parseUploadResponse(status, responseBody);

      if (status >= 200 && status < 300) {
        this.onSuccess?.(response);
        this.uploadingInfo.success = true;
        setTimeout(() => {
          this.onComplete?.();
          if (this.resetAfterUpload) {
            this.resetUploader();
          }
        }, 2500);
      } else {
        this.onFailure?.(response);
        this.uploadingInfo.success = false;
        this.uploadingInfo.error = this.extractUploadError(response);
      }
    }, 2000);
  }

  private parseUploadResponse(status: number, responseBody: unknown) {
    if (status === 0) {
      return {error: `Could not connect to the ${this.externalName} server`};
    }

    if (typeof responseBody !== 'string') {
      return responseBody;
    }

    try {
      return JSON.parse(responseBody);
    } catch (error) {
      console.error(error);
      return responseBody;
    }
  }

  private extractUploadError(response: unknown): string {
    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object' && 'error' in response) {
      return String(response.error);
    }

    return 'Unknown error';
  }

  // onClickFailureCancelInternal() {
  //   console.log('onClickFailureCancelInternal');
  // }

  refreshShownUploadZones = () => {
    if (this.singleDropZone) {
      const firstEmpty = this.uploadZones.find((z) => !z.model || z.model.length === 0);
      this.shownUploadZones = firstEmpty ? [firstEmpty] : [];
    }
  };

  createUploadZones(files: FileUploadSpec) {
    const zones = Object.entries(files).map(([uploadName, uploadData]) => {
      const uploadType = uploadData.type === 'archive' ? 'zip' : uploadData.type;
      const typeData = ACCEPTED_TYPES[uploadType];
      if (!typeData) {
        throw new Error(`Invalid type provided to File Uploader ${uploadData.type}`);
      }

      return {
        name: uploadName,
        model: null,
        accept: `.${typeData.extensions.join(',.')}`,
        accepts: typeData.extensions,
        rejects: null,
        display: {
          name: uploadData.name,
          icon: typeData.icon,
          type: typeData.name,
          error: false,
        },
      };
    });

    this.shownUploadZones = this.singleDropZone ? [zones[0]] : zones;
    this.uploadZones = zones;
  }
}
