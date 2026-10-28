import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {SwUpdate} from '@angular/service-worker';
import {UpdateAvailableComponent} from './update-available.component';

const UPDATE_POLL_INTERVAL = 4 * 60 * 60 * 1000; // 4 Hours
const UPDATE_REMINDER_DELAY = 10 * 60 * 1000; // 10 Minutes

@Injectable()
export class CheckForUpdateService {
  private updatePrompt?: MatSnackBarRef<UpdateAvailableComponent>;
  private updateReminder?: ReturnType<typeof setTimeout>;

  constructor(
    private updates: SwUpdate,
    private _snackBar: MatSnackBar,
  ) {
    setInterval(() => this.checkForUpdate(), UPDATE_POLL_INTERVAL);

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
      // Failed checks (e.g. offline) are retried on the next poll
      this.updates.checkForUpdate().catch(() => undefined);
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
