import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription, catchError, finalize, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

/**
 * Allow files to be dropped for upload
 */
@Component({
  selector: 'f-file-drop',
  templateUrl: 'file-drop.component.html',
  styleUrls: ['file-drop.component.scss'],
})
export class FileDropComponent {
  @Input() selectFn: (file: File) => boolean = () => true;

  /**
   * Have a singe file that can be set
   */
  file: File;

  @Input() endpoint: string;
  @Input() body: object;
  @Output() fileChange = new EventEmitter<File>();

  uploadProgress: number;
  uploadSub: Subscription;
  /**
   * Report all files dropped
   */
  @Output() filesDropped = new EventEmitter<File[]>();

  public message: string = 'Drop a file here to upload';

  constructor(
    private http: HttpClient,
    private alert: AlertService,
  ) {}

  public get isUploadMode() {
    return this.endpoint;
  }

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      this.file = file;
      console.log(this.file.name);
    }
  }

  public onFileDragOver(files: FileList) {
    this.file = files[0];
  }

  public upload() {
    if (this.file) {
      const formData = new FormData();

      formData.append('file', this.file);
      const upload$ = this.http.post(this.endpoint, formData, { reportProgress: true, observe: 'events' }).pipe(
        finalize(() => {
          this.reset();
        }),
        catchError(this.handleError),
      );

      this.uploadSub = upload$.subscribe((event) => {
        if (event.type == HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
        }
        if (event.type == HttpEventType.Response) {
          if (event.ok) {
            this.alert.success(`File uploaded successfully`);
          }
        }
      });
    }
  }

  private handleError(error: HttpErrorResponse) {
    this.alert.error(`Error uploading file: ${error.error}`);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }

  public setFile(files: FileList) {
    const validFiles = Array.from(files as ArrayLike<File>).filter(this.selectFn);

    if (validFiles.length > 0) {
      this.filesDropped.emit(validFiles);

      const file = validFiles[0];
      this.file = file;
      this.fileChange.emit(file);
    } else {
      this.message = 'Please drop a file here to upload';
    }
  }
}
