import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AlertService} from '../../services/alert.service';
import {CsvResultModalComponent} from './csv-result-modal.component';

export interface CsvRow {
  row: unknown;
  message?: string;
  error?: string;
}

export interface CsvResult {
  success?: CsvRow[];
  errors?: CsvRow[];
  ignored?: CsvRow[];
}

export interface CsvResultModalData {
  title: string;
  csvResult: CsvResult;
}

@Injectable({
  providedIn: 'root',
})
export class CsvResultModalService {
  constructor(
    public dialog: MatDialog,
    private alertService: AlertService,
  ) {}

  public show(title: string, csvResult: CsvResult) {
    const normalised = this.normaliseResponse(csvResult);
    this.showSummaryAlert(normalised);

    this.dialog.open<CsvResultModalComponent, CsvResultModalData>(CsvResultModalComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: {
        title,
        csvResult: normalised,
      },
    });
  }

  private normaliseResponse(csvResult: CsvResult): CsvResult {
    return {
      success: csvResult?.success ?? [],
      errors: csvResult?.errors ?? [],
      ignored: csvResult?.ignored ?? [],
    };
  }

  private showSummaryAlert(csvResult: CsvResult): void {
    const successCount = csvResult.success?.length ?? 0;
    const errorCount = csvResult.errors?.length ?? 0;

    if (errorCount === 0) {
      this.alertService.success(`Data uploaded. Success with ${successCount} items.`, 2000);
      return;
    }

    if (successCount > 0) {
      this.alertService.message(
        `Data uploaded, success with ${successCount} items, but ${errorCount} errors.`,
        6000,
      );
      return;
    }

    this.alertService.error(`Data uploaded but ${errorCount} errors`, 6000);
  }
}
