import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {SidekiqJobEntry, SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'f-sidekiq-jobs-modal',
  templateUrl: './sidekiq-jobs-modal.component.html',
  styleUrl: './sidekiq-jobs-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SidekiqJobsModalComponent implements OnInit {
  constructor(
    @Inject(AlertService) private alertService: AlertService,

    public dialogRef: MatDialogRef<SidekiqJobsModalComponent>,
    private sidekiqJobService: SidekiqJobService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
  ) {}

  sidekiqJobs: SidekiqJobEntry[] = [];
  ngOnInit(): void {
    this.sidekiqJobService.sidekiqJobsSubject.subscribe((jobs) => {
      this.sidekiqJobs = jobs;
      if (jobs.length === 0) {
        this.dismissModal();
      }
    });
  }

  viewJob(jobEntry: SidekiqJobEntry) {
    this.sidekiqProgressModalService.show(jobEntry.title, jobEntry.job.id).subscribe({
      next: (job) => {
        jobEntry.resultSubject.next(job);
      },
    });

    this.dismissModal();
  }

  removeJob(jobEntry: SidekiqJobEntry) {
    this.sidekiqJobService.removeJob(jobEntry.job.id);
  }

  public dismissModal() {
    this.dialogRef.close();
  }
}
