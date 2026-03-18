//
// Modal to show Doubtfire version info
//
import {Injectable, Component, Inject, AfterViewInit, OnInit} from '@angular/core';

import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {D2lAssessmentMapping} from 'src/app/api/models/d2l/d2l_assessment_mapping';
import {D2lAssessmentMappingService} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-d2l-unit-details-form',
  templateUrl: 'd2l-unit-details-form.component.html',
  styleUrl: 'd2l-unit-details-form.component.scss',
})
export class D2lUnitDetailsFormComponent implements OnInit {
  public d2lDataMapping: D2lAssessmentMapping = new D2lAssessmentMapping(this.data);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Unit,
    @Inject(MatDialogRef<D2lUnitDetailsFormComponent>)
    public dialogRef: MatDialogRef<D2lUnitDetailsFormComponent>,
    private alertService: AlertService,
    public d2lAssessmentMappingService: D2lAssessmentMappingService,
  ) {}

  ngOnInit(): void {
    this.data.loadD2lMapping().subscribe({
      next: (d2lDataMapping) => {
        this.d2lDataMapping = d2lDataMapping;
      },
      error: (_err) => {
        // No mapping found, create a new one
        this.d2lDataMapping = new D2lAssessmentMapping(this.data);
      },
    });
  }

  private saveAction(): Observable<D2lAssessmentMapping> {
    if (!this.d2lDataMapping.id) {
      if (!this.d2lDataMapping.orgUnitId && !this.d2lDataMapping.gradeObjectId) {
        return null;
      }
      return this.d2lAssessmentMappingService.post(
        {
          unitId: this.data.id,
          id: undefined,
        },
        {
          entity: this.d2lDataMapping,
          constructorParams: this.data,
        },
      );
    } else if (this.d2lDataMapping.hasChanges(this.d2lAssessmentMappingService.mapping)) {
      return this.d2lAssessmentMappingService.update(
        {
          unitId: this.data.id,
          id: this.d2lDataMapping.id,
        },
        {
          entity: this.d2lDataMapping,
        },
      );
    } else {
      return null;
    }
  }

  public saveAndClose(): void {
    const action = this.saveAction();

    if (action) {
      action.subscribe({
        next: () => {
          this.alertService.success('D2l details saved successfully');
          // Close the dialog
          this.dialogRef.close();
        },
        error: (err) => {
          this.alertService.error(`Failed to save unit ${err}`);
          console.error(err);
        },
      });
    } else {
      this.dialogRef.close();
    }
  }

  public delete(): void {
    this.d2lAssessmentMappingService
      .delete({unitId: this.data.id, id: this.d2lDataMapping.id})
      .subscribe({
        next: () => {
          this.alertService.success('D2l details deleted successfully');
          this.data.d2lMapping = undefined;
          this.dialogRef.close();
        },
        error: (err) => {
          this.alertService.error(`Failed to delete D2L details: ${err}`);
          console.error(err);
        },
      });
  }
}

/**
 * The about doubtfire modal service - used to create and show the modal
 */
// eslint-disable-next-line max-classes-per-file
@Injectable()
export class D2lUnitDetailsModal {
  constructor(public dialog: MatDialog) {}

  public open(unit: Unit): void {
    // Show dialog while the data above is being fetched
    this.dialog.open(D2lUnitDetailsFormComponent, {
      width: '600px',
      data: unit,
    });
  }
}
