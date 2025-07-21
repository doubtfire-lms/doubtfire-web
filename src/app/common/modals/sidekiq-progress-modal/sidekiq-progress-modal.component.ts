import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subject} from 'rxjs';
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
})
export class SidekiqProgressModalComponent implements OnInit, OnDestroy {
  private jobPollingInterval; // NodeJS.timeout

  pollFailureCount: number = 0;
  pollFailureLimit: number = 3;

  public job?: SidekiqJob;

  constructor(
    @Inject(AlertService) private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: SidekiqProgressModalData,

    public dialogRef: MatDialogRef<SidekiqProgressModalComponent, SidekiqProgressModalData>,
    private sidekiqJobService: SidekiqJobService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private snackBar: MatSnackBar,
  ) {}

  private shouldDisplayJobInProgressBar: boolean = true;

  ngOnInit(): void {
    this.pollFailureLimit = this.data.pollFailureLimit ?? 3;
    this.pollFailureCount = 0;

    this.getSidekiqJob();
    this.jobPollingInterval = setInterval(() => {
      this.getSidekiqJob();
    }, 1000);

    this.dialogRef.afterClosed().subscribe(() => {
      clearInterval(this.jobPollingInterval);
      this.displayJobInProgressBar();
    });
  }

  private readonly JOBS_KEY = 'ontrack_background_jobs';

  private storeJobId(jobId: string) {
    // TODO: move jobId storage into its own service, we can later use it to render ui in the header
    // TODO: this would allow the user to close their browser, wait for the job to complete, then view results after loading it up again
    try {
      const jobs: string[] = JSON.parse(localStorage.getItem(this.JOBS_KEY)) ?? [];
      if (!jobs.includes(jobId)) {
        jobs.push(jobId);
      }
      localStorage.setItem(this.JOBS_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error(e);
    }
  }

  private removeJobId(jobId: string) {
    try {
      const jobs: string[] = JSON.parse(localStorage.getItem(this.JOBS_KEY)) ?? [];
      const updatedJobs = jobs.filter((job) => job !== jobId);
      localStorage.setItem(this.JOBS_KEY, JSON.stringify(updatedJobs));
    } catch (e) {
      console.error(e);
    }
  }

  private getSidekiqJob() {
    if (!this.data.jobId) {
      clearInterval(this.jobPollingInterval);
      this.shouldDisplayJobInProgressBar = false;
      this.dialogRef.close();
    }

    this.sidekiqJobService.getSidekiqJob(this.data.jobId).subscribe({
      next: (job) => {
        this.storeJobId(job.id);
        this.job = job;
        this.pollFailureCount = 0;

        // TODO: update UI to indicate if its being queued, and not being worked yet
        if (job.status === 'complete' || job.status === 'failed') {
          clearInterval(this.jobPollingInterval);
        }
      },
      error: (error) => {
        console.error(error);
        this.pollFailureCount += 1;

        if (this.pollFailureCount >= this.pollFailureLimit) {
          this.alertService.error(error, 6000);
          clearInterval(this.jobPollingInterval);
        }
      },
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.jobPollingInterval);
  }

  public viewResult() {
    this.data.subject.next(this.job);

    this.shouldDisplayJobInProgressBar = false;
    this.dialogRef.close();
    this.removeJobId(this.data.jobId);
  }

  public dismissModal() {
    this.dialogRef.close();
  }

  public displayJobInProgressBar() {
    if (!this.job) {
      return;
    }

    if (!this.shouldDisplayJobInProgressBar) {
      return;
    }
    this.shouldDisplayJobInProgressBar = false;

    this.snackBar
      .open(`Job in progress: ${this.data.title}`, 'View', {
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      })
      .afterDismissed()
      .subscribe(() => {
        // TODO: if we know we have more than 1 in progress job, we could display a modal of a list of jobs to view
        // TODO: replace snack bar with an icon in the header?
        this.sidekiqProgressModalService.show(this.data.title, this.data.jobId).subscribe({
          next: (job) => {
            this.data.subject.next(job);
          },
          error: (error) => {
            console.error(error);
          },
        });
      });
  }
}
