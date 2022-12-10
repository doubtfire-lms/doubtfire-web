import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum AlertType {
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
      case AlertType.SUCCESS:
        this.snackBar.open(message, action, {
          duration: duration ? duration : 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['alert-service-success'],
        });
        break;
      case AlertType.WARNING:
        this.snackBar.open(message, action, {
          duration: duration ? duration : 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['alert-service-warning'],
        });
        break;
      case AlertType.DANGER:
        this.snackBar.open(message, action, {
          duration: duration ? duration : 8000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['alert-service-danger'],
        });
        break;
    }
  }
}
