import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'create-unit-modal',
  templateUrl: 'create-unit-modal.component.html',
  styleUrls: ['create-unit-modal.component.scss'],
})
export class CreateUnitModalComponent {
  constructor(
    public dialogRef: MatDialogRef<CreateUnitModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) public alertService: any
  ) {}

  ngOnInit() {
    console.log(this.data);
    console.log('hello');
  }
}
