import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Allow files to be dropped for upload
 */
@Component({
  selector: 'f-file-drop',
  templateUrl: 'file-drop.component.html',
  // styleUrls: ['object-select.component.scss'],
})
export class FileDropComponent {
  @Input() selectFn: (file: File) => boolean = () => true;

  /**
   * Have a singe file that can be set
   */
  @Input() file: File;

  @Input() endpoint: string;

  @Input() body: object;

  @Output() fileChange = new EventEmitter<File>();

  /**
   * Report all files dropped
   */
  @Output() filesDropped = new EventEmitter<File[]>();

  public message: string = 'Drop a file here to upload';

  constructor() {}

  public get isUploadMode() {
    return this.endpoint;
  }

  public upload() {}

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
