import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alertService, IntendedLearningOutcome } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'unit-ilo-edit-modal',
  templateUrl: './unit-ilo-edit-modal.component.html',
  styleUrls: ['./unit-ilo-edit-modal.component.scss'],
})
export class UnitIloEditModalComponent {
  isNew: boolean;
  unit: any;
  ilo: any;
  prototypeIlo: { name: string; description: string; abbreviation: string };
  save_data: any;

  constructor(
    public dialogRef: MatDialogRef<UnitIloEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) public alertService: any,
    @Inject(IntendedLearningOutcome) public IntendedLearningOutcome: any
  ) {}

  ngOnInit() {
    this.prototypeIlo = { name: null, description: null, abbreviation: null };
    this.isNew = !this.data.ilo;
    this.ilo = this.data.ilo || this.prototypeIlo;
    this.unit = this.data.unit;
  }

  saveILO() {
    this.save_data = {
      unit_id: this.unit.id,
      name: this.ilo.name,
      description: this.ilo.description,
      abbreviation: this.ilo.abbreviation,
    };

    if (this.isNew) {
      console.log(this.save_data);
      this.IntendedLearningOutcome.create(
        this.save_data,
        (response) => {
          this.unit.ilos.push(response);
          this.alertService.add('success', 'Intended Learning Outcome Added', 2000);
          this.dialogRef.close();
        },
        (response) => {
          if (response.data.error != null) {
            this.alertService.add('danger', 'Error: ' + response.data.error, 6000);
          }
        }
      );
    } else {
      this.save_data.id = this.ilo.id;
      console.log(this.save_data);
      this.IntendedLearningOutcome.update(this.save_data).$promise.then(
        () => {
          this.alertService.add('success', 'Intended Learning Outcome Updated', 2000);
          this.dialogRef.close();
        },
        (response) => {
          if (response.data.error != null) {
            this.alertService.add('danger', 'Error: ' + response.data.error, 6000);
          }
        }
      );
    }
  }
}
