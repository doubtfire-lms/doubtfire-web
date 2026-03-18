import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SidekiqJobsModalComponent} from './sidekiq-jobs-modal.component';

@Injectable({
  providedIn: 'root',
})
export class SidekiqJobsModalService {
  constructor(public dialog: MatDialog) {}

  public show() {
    this.dialog.open<SidekiqJobsModalComponent>(SidekiqJobsModalComponent, {
      position: {top: '2.5%'},
      width: '100%',
      maxWidth: '650px',
    });
  }
}
