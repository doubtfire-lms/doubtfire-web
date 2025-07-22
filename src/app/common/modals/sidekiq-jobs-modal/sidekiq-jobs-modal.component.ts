import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'f-sidekiq-jobs-modal',
  templateUrl: './sidekiq-jobs-modal.component.html',
  styleUrl: './sidekiq-jobs-modal.component.scss',
})
export class SidekiqJobsModalComponent implements OnInit {
  constructor(
    @Inject(AlertService) private alertService: AlertService,

    public dialogRef: MatDialogRef<SidekiqJobsModalComponent>,
    private sidekiqJobService: SidekiqJobService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
  ) {}

  sidekiqJobs: SidekiqJob[] = [];
  ngOnInit(): void {
    this.sidekiqJobService.sidekiqJobsSubject.subscribe((jobs) => {
      this.sidekiqJobs = jobs;
      if (jobs.length === 0) {
        this.dismissModal();
      }
    });
  }

  viewJob(job: SidekiqJob) {
    const jobData = this.sidekiqJobService.sidekiqJobCallbacks.get(job.id);
    this.sidekiqProgressModalService.show(jobData.title, job.id).subscribe({
      next: (job) => {
        jobData.subject.next(job);
      },
    });

    this.dismissModal();
  }

  getJobTitle(job: SidekiqJob) {
    const jobData = this.sidekiqJobService.sidekiqJobCallbacks.get(job.id);
    return jobData.title;
  }

  removeJob(job: SidekiqJob) {
    this.sidekiqJobService.removeJob(job.id);
  }

  public dismissModal() {
    this.dialogRef.close();
  }
}
