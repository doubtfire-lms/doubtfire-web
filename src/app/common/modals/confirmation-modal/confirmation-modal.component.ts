import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {AlertService} from '../../services/alert.service';

export interface ConfirmationModalData {
  title: string;
  message: string;
  action?: () => void;
  cancelAction?: () => void;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, MatIcon, CdkScrollable, MatDialogContent, MatDialogActions, MatButton],
})
export class ConfirmationModalComponent implements OnInit {
  @Input() title: string;
  @Input() message: string;
  @Input() action: () => void;
  @Input() cancelActionFn: () => void;
  @Input() confirmText: string;
  @Input() cancelText: string;

  constructor(
    @Inject(AlertService) private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationModalData,

    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
  ) {}

  ngOnInit(): void {
    this.title = this.data.title;
    this.message = this.data.message;
    this.action = this.data.action;
    this.cancelActionFn = this.data.cancelAction;
    this.confirmText = this.data.confirmText ?? 'Confirm';
    this.cancelText = this.data.cancelText ?? 'Cancel';
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
    if (typeof this.cancelActionFn === 'function') {
      this.cancelActionFn();
    } else {
      this.alertService.success(`${this.title} action cancelled.`);
    }
    this.dialogRef.close();
  }
}
