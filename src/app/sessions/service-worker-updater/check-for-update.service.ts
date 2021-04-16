import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class CheckForUpdateService {
  constructor(appRef: ApplicationRef, private updates: SwUpdate, private _snackBar: MatSnackBar) {
    console.log('Checking for updates every 6 hours');

    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    // const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));

    // Checks every 4 hours
    const updateInterval$ = interval(4 * 60 * 60 * 1000);
    // const updateIntervalOnceAppIsStable$ = concat(appIsStable$, updateInterval$);

    updateInterval$.subscribe(() => {
      console.log('Checking for updates');
      // If uncommented, will alert the user that it's checking for updates

      // let snackBarRef = this._snackBar.open('Checking for app updates');
      // snackBarRef.onAction().subscribe(result => {
      //     updates.activateUpdate().then(() => document.location.reload());
      // });
      this.updates.checkForUpdate();
    });

    this.updates.available.subscribe((event) => {
      const snackBarRef = this._snackBar.open(
        'An update to the app has been found, would you like to refresh now?',
        'refresh'
      );
      snackBarRef.onAction().subscribe((result) => {
        this.updates.activateUpdate().then(() => document.location.reload());
      });
    });

    this.updates.unrecoverable.subscribe((event) => {
      document.location.reload();
    });
  }

  checkForupdate() {
    console.log('Checking for udpate');
    this.updates.checkForUpdate();
  }
}
