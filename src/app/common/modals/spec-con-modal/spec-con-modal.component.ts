import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Project} from 'src/app/api/models/doubtfire-model';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'f-spec-con-modal',
  templateUrl: './spec-con-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SpecConModalComponent {
  public days: number = 0;

  constructor(
    public dialogRef: MatDialogRef<SpecConModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {project: Project},
    private alerts: AlertService,
  ) {
    this.days = this.data.project.specConDays;
  }

  public get project(): Project {
    return this.data.project;
  }

  public save(): void {
    this.project.applySpecCon(this.days).subscribe({
      next: (_project: Project) => {
        this.alerts.success('Extension applied.');
      },
      error: (message) => {
        this.alerts.error(`Error applying extension: ${message}`);
      },
    });
  }
}
