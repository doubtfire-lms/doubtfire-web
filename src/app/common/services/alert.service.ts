import { Component, Inject, Injectable, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { ConfettiService } from './confetti.service';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private snackBar: MatSnackBar, private confetti: ConfettiService) {}

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

  public celebrate(message: string, duration: number = 6000): void {
    this._openSnackBar(message, 'celebration_outline', duration);
    this.confetti.canon(0.95, 0.05, 210);
  }
}

@Component({
  selector: 'f-alert',
  template: `<span class="flex space-x-4 items-center center-items">
    <span class="flex">
      <mat-icon>{{ data?.icon }}</mat-icon>
    </span>
    <span class="flex-grow">{{ data?.message }}</span>

    <span matSnackBarActions class="ml-auto">
      <button mat-button matSnackBarAction (click)="snackBarRef.dismissWithAction()">Close</button>
    </span></span
  >`,
})
export class AlertComponent {
  snackBarRef = inject(MatSnackBarRef);
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
