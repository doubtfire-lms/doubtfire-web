import {Component, Inject, Input, OnInit} from '@angular/core';
import {csvResultModalService, csvUploadModalService} from 'src/app/ajs-upgraded-providers';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-upload-grades',
  templateUrl: 'upload-grades.component.html',
  styleUrl: 'upload-grades.component.scss',
})
export class UploadGradesComponent implements OnInit {
  @Input() unit: Unit;

  constructor(
    @Inject(csvUploadModalService) private csvUploadModal: any,
    private sidekiqModalService: SidekiqProgressModalService,
    @Inject(csvResultModalService) private csvResultModal: any,
    private alertService: AlertService,
  ) {}

  public ngOnInit(): void {
    if (!this.unit) {
      return console.error(`Invalid unit`);
    }
  }

  public uploadGradesCSV() {
    this.csvUploadModal.show(
      'Upload Student Grades as CSV',
      'Import student grades',
      {
        file: {name: 'Feedback Templates CSV Data', type: 'csv'},
      },
      this.unit.gradesCSVUploadUrl,
      (response: SidekiqJob) => {
        if (!response) {
          this.alertService.error('Failed to import grades', 6000);
          return;
        }

        this.sidekiqModalService.show('Import student grades', response.id).subscribe({
          next: (job) => {
            console.log(job);
            this.csvResultModal.show('Student grade import results', JSON.parse(job.result));
            console.log('completed import!');
          },
          error: (error) => {
            console.error(error);
            this.alertService.error('Failed to import grades', 6000);
          },
        });
      },
    );
  }
}
