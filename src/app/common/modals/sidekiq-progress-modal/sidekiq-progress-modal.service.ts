import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {
  SidekiqProgressModalComponent,
  SidekiqProgressModalData,
} from './sidekiq-progress-modal.component';
import {Subject} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';

@Injectable({
  providedIn: 'root',
})
export class SidekiqProgressModalService {
  constructor(
    public dialog: MatDialog,
    private sidekiqJobService: SidekiqJobService,
  ) {}

  public show(title: string, jobId: string) {
    const subject = new Subject<SidekiqJob>();

    this.sidekiqJobService.sidekiqJobCallbacks.set(jobId, {
      title,
      subject,
    });

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
