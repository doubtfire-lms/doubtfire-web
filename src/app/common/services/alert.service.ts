import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private snackBar: MatSnackBar) {}

  // if response.errors.length == 0
  //   alertService.add("success", "Data uploaded. Success with #{response.success.length} items.", 2000)
  // else if response.success.length > 0
  //   alertService.add("warning", "Data uploaded, success with #{response.success.length} items, but #{response.errors.length} errors.", 6000)
  // else
  //   alertService.add("danger", "Data uploaded but #{response.errors.length} errors", 6000)

  showAlert(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 2000,
    });
  }
}
