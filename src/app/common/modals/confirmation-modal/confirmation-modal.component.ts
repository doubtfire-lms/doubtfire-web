import {Component, OnInit, Input, Inject} from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface ConfirmationModalData {
  title: string;
  message: string;
  action?: any;
}

@Component({
  selector: 'confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent implements OnInit {
  @Input() title: string;
  @Input() message: string;
  @Input() action: () => void;

  constructor(
    @Inject(AlertService) private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationModalData,

    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
  ) {}

  ngOnInit(): void {
    this.title = this.data.title;
    this.message = this.data.message;
    this.action = this.data.action;
  }

  public confirmAction() {
    if (typeof this.action === 'function') {
      this.action();
    } else {
      this.alertService.error(`${this.title} action failed.`);
    }
    this.dialogRef.close();
  }

  public cancelAction() {
    this.alertService.success(`${this.title} action cancelled.`);
    this.dialogRef.close();
  }
}
