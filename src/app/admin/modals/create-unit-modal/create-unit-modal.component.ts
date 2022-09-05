import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alertService, analyticsService, Unit } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'create-unit-modal',
  templateUrl: 'create-unit-modal.component.html',
  styleUrls: ['create-unit-modal.component.scss'],
})
export class CreateUnitModalComponent {
  units: any;
  unit: any;

  constructor(
    public dialogRef: MatDialogRef<CreateUnitModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) public alertService: any,
    @Inject(analyticsService) public analyticsService: any,
    @Inject(Unit) public Unit: any
  ) {}

  ngOnInit() {
    this.analyticsService.event('Unit Admin', 'Started to Create Unit');
    this.units = this.data.units;
    this.unit = { code: null, name: null };
  }

  saveUnit() {
    console.log(this.unit.name + ' ' + this.unit.code);
    this.Unit.create(
      { unit: this.unit },
      (response) => {
        this.alertService.add('success', 'Unit Created.', 2000);
        this.units.push(response);
        this.dialogRef.close();
        return this.analyticsService.event('Unit Admin', 'Saved New Unit');
      },
      (response) => {
        this.alertService.add('danger', `Error creating unit - ${response.data.error}`);
      }
    );
  }
}
