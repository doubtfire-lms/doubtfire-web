import { Component, Input, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'progress-modal',
  templateUrl: './progress-modal.component.html',
  styleUrls: ['./progress-modal.component.scss'],
})
export class ProgressModalComponent implements OnInit {
  title: any;
  message: any;

  constructor(public dialogRef: MatDialogRef<ProgressModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.title = this.data.title;
    this.message = this.data.message;
  }

  close() {
    this.dialogRef.close();
  }
}
