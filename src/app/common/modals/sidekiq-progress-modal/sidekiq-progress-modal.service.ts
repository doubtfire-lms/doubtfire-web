import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {
  SidekiqProgressModalComponent,
  SidekiqProgressModalData,
} from './sidekiq-progress-modal.component';

@Injectable({
  providedIn: 'root',
})
export class SidekiqProgressModalService {
  constructor(
    public dialog: MatDialog,
    private sidekiqJobService: SidekiqJobService,
  ) {}

  public show(title: string, jobId: string) {
    const subject: Subject<SidekiqJob> = new Subject();

    this.sidekiqJobService.setJob(jobId, title, subject);

    this.dialog.open<SidekiqProgressModalComponent, SidekiqProgressModalData>(
      SidekiqProgressModalComponent,
      {
        data: {
          title,
          jobId,
          subject: subject,
          pollFailureLimit: 5,
        },
        position: {top: '2.5%'},
        width: '100%',
        maxWidth: '650px',
      },
    );
    return subject;
  }
}
