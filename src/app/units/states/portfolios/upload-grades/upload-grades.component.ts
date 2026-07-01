import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {CsvResultModalService} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from 'src/app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-upload-grades',
  templateUrl: 'upload-grades.component.html',
  styleUrl: 'upload-grades.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UploadGradesComponent implements OnInit {
  @Input() unit: Unit;

  constructor(
    private sidekiqModalService: SidekiqProgressModalService,
    private csvUploadModal: CsvUploadModalService,
    private csvResultModal: CsvResultModalService,
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
            this.csvResultModal.show('Student grade import results', JSON.parse(job.result));
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
