import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GrantExtensionFormComponent } from './grant-extension-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'f-grant-extension-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, GrantExtensionFormComponent],
  template: `
    <h2 mat-dialog-title>Grant Extension</h2>
    <mat-dialog-content>
      <f-grant-extension-form></f-grant-extension-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `
})
export class GrantExtensionDialogComponent {
  constructor(private dialogRef: MatDialogRef<GrantExtensionDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
