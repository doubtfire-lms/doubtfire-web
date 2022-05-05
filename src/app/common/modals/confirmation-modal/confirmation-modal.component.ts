import { Component, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alertService } from '../../../ajs-upgraded-providers';

@Component({
  selector: 'confirmation-modal',
  templateUrl: 'confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  title: any;
  message: any;
  action: any;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) public alert: any
  ) {}

  ngOnInit() {
    this.title = this.data.title;
    this.message = this.data.message;
    this.action = this.data.action;
    console.log(this.alert);
  }

  confirmAction() {
    this.action();
    this.dialogRef.close();
  }

  cancelAction() {
    this.alert.add('info', `${this.title} action cancelled`, 3000);
    this.dialogRef.close();
  }
}
