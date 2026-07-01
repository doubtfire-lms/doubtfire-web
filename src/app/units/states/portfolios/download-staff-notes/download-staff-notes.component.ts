import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-download-staff-notes',
  templateUrl: 'download-staff-notes.component.html',
  styleUrl: 'download-staff-notes.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DownloadStaffNotesComponent implements OnInit {
  @Input() unit: Unit;

  constructor(private alertService: AlertService) {}

  public ngOnInit(): void {
    if (!this.unit) {
      return console.error(`Invalid unit`);
    }
  }

  public downloadStaffNotesCsv() {
    this.unit.downloadStaffNotesCsv();
  }
}
