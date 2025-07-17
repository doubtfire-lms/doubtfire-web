import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {
  SidekiqProgressModalComponent,
  SidekiqProgressModalData,
} from './sidekiq-progress-modal.component';
import {Subject} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';

@Injectable({
  providedIn: 'root',
})
export class SidekiqProgressModalService {
  constructor(public dialog: MatDialog) {}

  public show(title: string, jobId: string) {
    const subject = new Subject<SidekiqJob>();

    this.dialog.open<SidekiqProgressModalComponent, SidekiqProgressModalData>(
      SidekiqProgressModalComponent,
      {
        data: {
          title,
          jobId,
          subject: subject,
          pollFailureLimit: 3,
        },
        position: {top: '2.5%'},
        width: '100%',
        maxWidth: '650px',
      },
    );
    return subject;
  }
}
