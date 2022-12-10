import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum AlertType {
  INFO,
  SUCCESS,
  WARNING,
  DANGER,
}
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private snackBar: MatSnackBar) {}
  add(type: AlertType, message: string, duration?: number, action = 'Dismiss') {
    switch (type) {
      case AlertType.INFO:
        this.snackBar.open(message, action, {
          duration: duration ? duration : 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['alert-info'],
        });
        break;
      case AlertType.SUCCESS:
        this.snackBar.open(message, action, {
          duration: duration ? duration : 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['alert-success'],
        });
        break;
      case AlertType.WARNING:
        this.snackBar.open(message, action, {
          duration: duration ? duration : 6000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['alert-warning'],
        });
        break;
      case AlertType.DANGER:
        this.snackBar.open(message, action, {
          duration: duration ? duration : 8000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['alert-danger'],
        });
        break;
    }
  }
}
