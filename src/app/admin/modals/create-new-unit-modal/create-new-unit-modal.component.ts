import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CreateNewUnitModalContentComponent} from './create-new-unit-modal-content.component';

@Component({
  selector: 'create-new-unit-modal',
  templateUrl: './create-new-unit-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CreateNewUnitModal {
  constructor(public dialog: MatDialog) {}
  public show(): void {
    this.dialog.open(CreateNewUnitModalContentComponent, {
      width: '500px',
    });
  }
}
