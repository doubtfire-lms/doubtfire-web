import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  DiscussedInClassReasonModalComponent,
  DiscussedInClassReasonModalData,
} from './discussed-in-class-reason-modal.component';

@Injectable({
  providedIn: 'root',
})
export class DiscussedInClassReasonModalService {
  constructor(private dialog: MatDialog) {}

  public show(
    title: string,
    prompt: string,
    prefix: string,
  ): MatDialogRef<DiscussedInClassReasonModalComponent, string | undefined> {
    return this.dialog.open<
      DiscussedInClassReasonModalComponent,
      DiscussedInClassReasonModalData,
      string | undefined
    >(DiscussedInClassReasonModalComponent, {
      data: {
        title,
        prompt,
        prefix,
      },
      position: {top: '2.5%'},
      width: '100%',
      maxWidth: '700px',
      autoFocus: false,
    });
  }
}
