// TODO: remove this
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FileUploadControl, FileUploadValidators} from '@iplab/ngx-file-upload';
import {UserService} from 'src/app/api/services/user.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

interface File {
  name: string;
  type: string;
}

export const ACCEPTED_TYPES = {
  document: {
    extensions: ['pdf', 'ps'],
    // icon: 'fa-file-pdf-o',
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
    // icon: 'fa-file-code-o',
    // icon: 'code',
    icon: 'integration_instructions_outlined',
    name: 'code',
  },
  image: {
    extensions: ['png', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg', 'gif'],
    // icon: 'fa-file-image-o',
    icon: 'image_outlined',
    name: 'image',
  },
  zip: {
    extensions: ['zip', 'tar.gz', 'tar'],
    // icon: 'fa-file-zip-o',
    icon: 'zip_outlined',
    name: 'archive',
  },
} as const;

@Component({
  selector: 'f-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent implements OnInit {
  @Input() files: File[];
  @Input() url: string;
  @Input() method = 'POST';
  @Input() payload?: any;

  @Input() onBeforeUpload?: () => void;
  @Input() onSuccess?: (response: any) => void;
  @Input() onFailure?: (response: any) => void;
  @Input() onComplete?: () => void;
  @Input() onClickFailureCancel?: () => void;

  @Input() isUploading: boolean;
  @Input() isReady: boolean;
  @Input() showName: boolean = true;
  @Input() asButton: boolean = false;
  @Input() filesSelected: any;
  @Input() singleDropZone: boolean = false;
  @Input() showUploadButton: boolean = true;
  @Input() resetAfterUpload: boolean = true;

  @Input() initiateUpload?: () => void;

  // HACK: workaround for TypeScript -> Coffeescript communication
  // Once all parent components such as upload-submission-modal are migrated..
  // .. these *wont* not be necessary anymore
  // Parent components should declare the file-uploader using @ViewChild() and directly call initiateUpload()
  @Output() isReadyChange = new EventEmitter<boolean>();
  @Output() uploadReady = new EventEmitter<() => void>();

  public readonly ACCEPTED_TYPES = ACCEPTED_TYPES;

  public showUploader: boolean = false;
  public uploadingInfo: any = null;

  public fileUploadControl = new FileUploadControl({listVisible: false, discardInvalid: true});
  public shownUploadZones = [];
  public uploadZones = [];
  public dropSupported: boolean = true;

  constructor(private userService: UserService, private constants: DoubtfireConstants) {}

  private externalName: string = 'OnTrack'
  ngOnInit(): void {
    this.showUploader = !this.asButton;
    this.createUploadZones(this.files);

    this.fileUploadControl.valueChanges.subscribe((value) => {
      setTimeout(() => {
        this.validateFiles();
      });
    });


    this.uploadReady.emit(this.initiateUploadInternal.bind(this));

    if (!this.onClickFailureCancel) {
      this.onClickFailureCancel = this.resetUploader;
    }

    this.resetUploader();

    this.constants.ExternalName.subscribe(name => {
      this.externalName = name;
    })

  }

  public backToUpload() {
    this.isUploading = false;
    this.uploadingInfo = null;
  }

  validateFiles() {
    for (const upload of this.shownUploadZones) {
      if (upload.model?.length) {
        console.log(upload);
        const name: string = upload.model[0].name.toLowerCase();
        const accepts: string[] = upload.accepts.map((ext: string) => ext.toLowerCase());
        console.log(name, accepts);
        const valid = accepts.some((ext) => name.endsWith(ext));
        console.log(valid);
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
  }

  clearEnqueuedUpload(upload: any) {
    upload.model = null;
    this.refreshShownUploadZones();
  }


  readyToUpload(): boolean {
    const allSelected = this.uploadZones.every((zone) => zone.model?.length);
    this.updateReadyState(allSelected);
    return allSelected;
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
      this.clearEnqueuedUpload(upload);
    }
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

    const xhr = new XMLHttpRequest();
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
        if (typeof v === 'object') v = JSON.stringify(v);
        form.append(key, v as any);
      }
    }

    xhr.upload.onprogress = (event) => {
      if (event.total) {
        this.uploadingInfo.progress = Math.floor((event.loaded / event.total) * 100);
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        setTimeout(() => {
          this.uploadingInfo.complete = true;
          let response: any = null;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            if (xhr.status === 0) {
              response = {error: `Could not connect to ${this.externalName} the server`};
            } else {
              response = xhr.responseText;
            }
          }

          if (xhr.status >= 200 && xhr.status < 300) {
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
            this.uploadingInfo.error = (response?.error ?? 'Unknown error') as string;
          }
        }, 2000);
      }
    };
    const method = this.method ?? 'POST';
    xhr.open(method, this.url, true);

    xhr.setRequestHeader('Auth-Token', this.userService.currentUser.authenticationToken);
    xhr.setRequestHeader('Username', this.userService.currentUser.username);

    xhr.send(form);
  }

  onClickFailureCancelInternal() {
    console.log('onClickFailureCancelInternal');
  }

  refreshShownUploadZones = () => {
    if (this.singleDropZone) {
      const firstEmpty = this.uploadZones.find((z) => !z.model || z.model.length === 0);
      this.shownUploadZones = firstEmpty ? [firstEmpty] : [];
    }
  };

  createUploadZones(files: File[]) {
    const zones = Object.entries(files).map(([uploadName, uploadData]) => {
      const typeData = ACCEPTED_TYPES[uploadData.type];
      if (!typeData) throw new Error(`Invalid type provided to File Uploader ${uploadData.type}`);

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

    console.log(zones, this.singleDropZone);

    this.shownUploadZones = this.singleDropZone ? [zones[0]] : zones;
    this.uploadZones = zones;

    console.log(this.shownUploadZones);
    console.log(this.uploadZones);
  }
}
