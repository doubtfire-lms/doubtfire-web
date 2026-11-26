import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
  ActivityType,
  ActivityTypeService,
  TutorialStream,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import {
  CsvResult,
  CsvResultModalService,
} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from 'src/app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'unit-tutorials-manager',
  templateUrl: 'unit-tutorials-manager.component.html',
  styleUrls: ['unit-tutorials-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitTutorialsManagerComponent implements OnInit {
  @Input() unit: Unit;

  activityTypes: ActivityType[] = new Array<ActivityType>();
  constructor(
    private activityTypeService: ActivityTypeService,
    private alertService: AlertService,
    private csvResultModalService: CsvResultModalService,
    private csvUploadModal: CsvUploadModalService,
  ) {}

  ngOnInit() {
    // Get the activity types
    this.activityTypeService.query().subscribe((activityTypes) => {
      this.activityTypes.push(...activityTypes);
    });
  }

  onClickNewActivity(activity: ActivityType) {
    this.unit.nextStream(activity.abbreviation).subscribe({
      next: (value: TutorialStream) => {
        this.alertService.success(`Added tutorial stream ${value.abbreviation}`, 2000);
      },
      error: (message) => {
        this.alertService.error(`Error creating tutorial stream: ${message}`, 8000);
      },
    });
  }

  // Streams must be uploaded before tutorials that use them - tutorials refer to streams by abbreviation
  public uploadTutorialStreamsCsv() {
    this.csvUploadModal.show(
      'Upload Tutorial Streams as CSV',
      'Upload a CSV of tutorial streams. Upload streams before the tutorials that use them.',
      {file: {name: 'Tutorial Streams CSV Data', type: 'csv'}},
      this.unit.tutorialStreamsCsvUrl,
      (response: CsvResult) => {
        this.csvResultModalService.show('Tutorial Stream Import Results', response);
        if (response.success.length > 0) {
          this.unit.refresh();
        }
      },
    );
  }

  public uploadTutorialsCsv() {
    this.csvUploadModal.show(
      'Upload Tutorials as CSV',
      'Upload a CSV of tutorials. Each tutorial stream used must already exist in the unit.',
      {file: {name: 'Tutorials CSV Data', type: 'csv'}},
      this.unit.tutorialsCsvUrl,
      (response: CsvResult) => {
        this.csvResultModalService.show('Tutorial Import Results', response);
        if (response.success.length > 0) {
          this.unit.refresh();
        }
      },
    );
  }
}
