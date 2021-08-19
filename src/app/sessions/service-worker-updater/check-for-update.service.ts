import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { delay } from 'rxjs/operators';
import { concat } from 'rxjs';

@Injectable()
export class CheckForUpdateService {
  constructor(appRef: ApplicationRef, private updates: SwUpdate, private _snackBar: MatSnackBar) {
    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    const appIsStable$ = appRef.isStable.pipe(delay(10000));

    // Checks every 4 hours
    const updateInterval$ = interval(4 * 60 * 60 * 1000);
    const updateIntervalOnceAppIsStable$ = concat(appIsStable$, updateInterval$);

    updateIntervalOnceAppIsStable$.subscribe(() => {
      console.log('Checking for updates')
      this.updates.checkForUpdate();
    });

    this.updates.available.subscribe(event => {
      const snackBarRef = this._snackBar.open(
        'An update to the app has been found, would you like to refresh now?',
        'refresh'
      );
      snackBarRef.onAction().subscribe((result) => {
        this.updates.activateUpdate().then(() => document.location.reload());
      });
    });

    this.updates.unrecoverable.subscribe(event => {
      this._snackBar.open(
        'An error occured during update, please refresh the page'
      );
    });
  }

  checkForupdate() {
    this.updates.checkForUpdate();
  }
}
