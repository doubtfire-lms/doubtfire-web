import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface AttachmentConfirmationDialogData {
  file: File;
}

@Component({
  selector: 'f-attachment-confirmation-dialog',
  templateUrl: './attachment-confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AttachmentConfirmationDialogComponent implements OnInit, OnDestroy {
  public file: File;
  public previewUrl: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<AttachmentConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AttachmentConfirmationDialogData,
  ) {}

  ngOnInit() {
    this.file = this.data.file;
    this.previewUrl = URL.createObjectURL(this.file);
  }

  ngOnDestroy() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  get isImage(): boolean {
    return this.file?.type?.startsWith('image/') ?? false;
  }

  get isPdf(): boolean {
    return this.file?.type === 'application/pdf' || this.file?.name?.toLowerCase().endsWith('.pdf');
  }

  get isAudio(): boolean {
    return this.file?.type?.startsWith('audio/') ?? false;
  }

  dismiss(confirmed: boolean) {
    this.dialogRef.close(confirmed);
  }

  formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
