import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'app-extension-modal',
  templateUrl: './extension-modal.component.html',
  styleUrls: ['./extension-modal.component.scss']
})
export class ExtensionModalComponent implements OnInit {
  weeksRequested: number = 1;
  reason: string = '';
  constructor(public dialogRef: MatDialogRef<ExtensionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) private alerts: any, ) { }

  ngOnInit() {
  }

  get weeksCanExtend() {
    return this.data.task.weeksCanExtend();
  }

  submitApplication() {
    this.data.task.applyForExtension(this.reason, this.weeksRequested,
      () => this.alerts.add('success', 'Extension requested.'),
      (error) => this.alerts.add('danger', 'Error ' + error.data.error));
  }

  cancel() {
    //
  }

}
