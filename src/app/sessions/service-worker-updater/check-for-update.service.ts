import {ApplicationRef, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {SwUpdate} from '@angular/service-worker';
import {UpdateAvailableComponent} from './update-available.component';

const UPDATE_REMINDER_DELAY = 10 * 60 * 1000; // 10 Minutes

@Injectable()
export class CheckForUpdateService {
  private updatePrompt?: MatSnackBarRef<UpdateAvailableComponent>;
  private updateReminder?: ReturnType<typeof setTimeout>;

  constructor(
    appRef: ApplicationRef,
    private updates: SwUpdate,
    private _snackBar: MatSnackBar,
  ) {
    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    // const appIsStable$ = appRef.isStable.pipe(delay(10000));

    // Checks every 4 hours
    // const updateInterval$ = interval(4 * 60 * 60 * 1000);
    // const updateIntervalOnceAppIsStable$ = concat(appIsStable$, updateInterval$);

    // updateIntervalOnceAppIsStable$.subscribe((() => {
    //   this.checkForUpdate();
    // }).bind(this));
    this.updates.versionUpdates.subscribe((updateEvent) => {
      if (updateEvent.type === 'VERSION_READY' && !this.updatePrompt) {
        this.promptForUpdate();
      }
    });

    this.updates.unrecoverable.subscribe((_event) => {
      _snackBar.open('An error occurred during update, please refresh the page');
    });
  }

  public checkForUpdate() {
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate();
    }
  }

  private promptForUpdate() {
    clearTimeout(this.updateReminder);
    this.updatePrompt = this._snackBar.openFromComponent(UpdateAvailableComponent);
    this.updatePrompt.afterDismissed().subscribe(({dismissedByAction}) => {
      this.updatePrompt = undefined;
      if (dismissedByAction) {
        this.updates.activateUpdate().then(() => document.location.reload());
      } else {
        // Dismissed (or replaced by another snack bar), so remind again later
        this.updateReminder = setTimeout(() => this.promptForUpdate(), UPDATE_REMINDER_DELAY);
      }
    });
  }
}
