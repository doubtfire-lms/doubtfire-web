import { Component, Inject, Injectable, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private snackBar: MatSnackBar) {}

  private _openSnackBar(message: string, icon: string, duration: number = 3000): void {
    this.snackBar.openFromComponent(AlertComponent, {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      data: {
        message: message,
        icon: icon,
      },
    });
  }

  public success(message: string, duration: number = 3000): void {
    this._openSnackBar(message, 'check_circle_outline', duration);
  }

  public error(message: string, duration: number = 5000): void {
    this._openSnackBar(message, 'error_outline', duration);
  }

  public message(message: string, duration: number = 3000): void {
    this._openSnackBar(message, 'info_outline', duration);
  }
}

@Component({
  selector: 'f-alert',
  template: `<span class="flex center-items">
      <mat-icon>{{ data?.icon }}</mat-icon>
      {{ data?.message }}
    </span>
    <span matSnackBarActions>
      <button mat-button matSnackBarAction (click)="snackBarRef.dismissWithAction()">Close</button>
    </span>`,
})
export class AlertComponent {
  snackBarRef = inject(MatSnackBarRef);
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
