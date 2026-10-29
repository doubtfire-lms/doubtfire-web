import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'f-update-available',
  templateUrl: './update-available.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatButton, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
})
export class UpdateAvailableComponent {
  snackBarRef = inject(MatSnackBarRef);
}
