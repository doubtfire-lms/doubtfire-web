import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationModalComponent, ConfirmationModalData} from './confirmation-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  constructor(public dialog: MatDialog) {}

  public show(title: string, message: string, action?: any) {
    this.dialog.open<ConfirmationModalComponent, ConfirmationModalData>(
      ConfirmationModalComponent,
      {
        data: {
          title,
          message,
          action,
        },
        position: {top: '2.5%'},
        width: '100%',
        maxWidth: '650px',
      },
    );
  }
}
