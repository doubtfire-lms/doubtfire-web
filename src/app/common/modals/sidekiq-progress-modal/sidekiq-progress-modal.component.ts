import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subject, Subscription} from 'rxjs';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {AlertService} from '../../services/alert.service';
import {SidekiqProgressModalService} from './sidekiq-progress-modal.service';

export interface SidekiqProgressModalData {
  title: string;
  jobId: string;
  subject: Subject<SidekiqJob>;
  pollFailureLimit?: number;
}

@Component({
  selector: 'f-sidekiq-progress-modal',
  templateUrl: './sidekiq-progress-modal.component.html',
  styleUrl: './sidekiq-progress-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SidekiqProgressModalComponent implements OnInit, OnDestroy {
  private readonly pollingInterval: number = 1250;

  private jobPollingTimeout?: ReturnType<typeof setTimeout>;
  private jobPollingSubscription?: Subscription;
  private pollingStopped = false;

  pollFailureCount: number = 0;
  pollFailureLimit: number = 5;

  public job?: SidekiqJob;

  constructor(
    @Inject(AlertService) private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: SidekiqProgressModalData,

    public dialogRef: MatDialogRef<SidekiqProgressModalComponent, SidekiqProgressModalData>,
    private sidekiqJobService: SidekiqJobService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.pollFailureLimit = this.data.pollFailureLimit ?? 5;
    this.pollFailureCount = 0;

    this.dialogRef.afterClosed().subscribe(() => {
      this.stopPolling();
    });

    this.getSidekiqJob();
  }

  private getSidekiqJob() {
    if (!this.data.jobId) {
      this.stopPolling();
      this.dialogRef.close();
      return;
    }

    this.jobPollingSubscription = this.sidekiqJobService.getSidekiqJob(this.data.jobId).subscribe({
      next: (job) => {
        this.sidekiqJobService.setJob(job.id, this.data.title, this.data.subject, job);
        this.job = job;
        this.pollFailureCount = 0;

        if (job.status === 'complete' || job.status === 'failed') {
          this.stopPolling();
        }
      },
      error: (error) => {
        console.error(error);
        this.pollFailureCount += 1;

        if (this.pollFailureCount >= this.pollFailureLimit) {
          this.alertService.error(error, 6000);
          this.stopPolling();
        } else {
          this.scheduleNextPoll();
        }
      },
      complete: () => this.scheduleNextPoll(),
    });
  }

  private scheduleNextPoll(): void {
    if (!this.pollingStopped) {
      this.jobPollingTimeout = setTimeout(() => this.getSidekiqJob(), this.pollingInterval);
    }
  }

  private stopPolling(): void {
    this.pollingStopped = true;
    clearTimeout(this.jobPollingTimeout);
    this.jobPollingSubscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  public viewResult() {
    this.data.subject.next(this.job);

    this.dialogRef.close();
    this.sidekiqJobService.removeJob(this.data.jobId);
  }

  public dismissModal() {
    this.dialogRef.close();
  }
}
