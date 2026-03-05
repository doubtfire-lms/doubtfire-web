import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CsvResultModalComponent} from './csv-result-modal.component';

interface CsvRow {
  row: object;
  message: string;
}

interface CsvResult {
  success?: CsvRow[];
  errors?: CsvRow[];
  ignored?: CsvRow[];
}

export interface CsvResultModalData {
  csvResult: CsvResult;
}

@Injectable({
  providedIn: 'root',
})
export class CsvResultModalService {
  constructor(public dialog: MatDialog) {}

  public show(csvResult: CsvResult) {
    this.dialog.open<CsvResultModalComponent, CsvResultModalData>(CsvResultModalComponent, {
      data: {
        csvResult,
      },
    });
  }
}
