import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NestedCsvDownloadModalComponent} from './nested-csv-download-modal.component';

@Injectable({
  providedIn: 'root',
})
export class NestedCsvDownloadModalService {
  constructor(public dialog: MatDialog) {}

  public show(url: string, name: string, type: string) {
    this.dialog.open<NestedCsvDownloadModalComponent, {url: string; name: string; type: string}>(
      NestedCsvDownloadModalComponent,
      {
        data: {url, name, type},
        width: '500px',
      },
    );
  }
}
