import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const CSS_TYPE = {
  INFO: 'alert-info',
  SUCCESS: 'alert-success',
  WARNING: 'alert-warning',
  DANGER: 'alert-danger',
};
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private snackBar: MatSnackBar) {}

  private _open(type: string, message: string, duration: number, action: string) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [type, 'allow-new-line'],
    });
  }

  info(message: string, duration?: number, action = 'Dismiss') {
    this._open(CSS_TYPE.INFO, message, duration ? duration : 3000, action);
  }

  success(message: string, duration?: number, action = 'Dismiss') {
    this._open(CSS_TYPE.SUCCESS, message, duration ? duration : 5000, action);
  }

  warning(message: string, duration?: number, action = 'Dismiss') {
    this._open(CSS_TYPE.WARNING, message, duration ? duration : 6000, action);
  }

  danger(message: string, duration?: number, action = 'Dismiss') {
    this._open(CSS_TYPE.DANGER, message, duration ? duration : 8000, action);
  }

  // used to close a snackbar
  clear() {
    this.snackBar.dismiss();
  }
}
