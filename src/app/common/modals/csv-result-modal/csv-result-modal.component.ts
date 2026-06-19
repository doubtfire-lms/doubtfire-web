import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {CsvResult, CsvResultModalData, CsvRow} from './csv-result-modal.service';

type CsvResultSelection = 'success' | 'errors' | 'ignored';

interface CsvDisplayRow {
  item: CsvRow;
  rowObject: Record<string, unknown> | null;
  otherData: string;
}

@Component({
  selector: 'f-csv-result-modal',
  templateUrl: './csv-result-modal.component.html',
  styleUrls: ['./csv-result-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CsvResultModalComponent implements AfterViewInit {
  public readonly pageSize = 10;
  public activeCsvResponseSelection: CsvResultSelection;
  public commonKeys: string[] = [];
  public displayedColumns: string[] = ['message', 'other'];
  public dynamicColumnIds: string[] = [];
  public dataSource: MatTableDataSource<CsvDisplayRow> = new MatTableDataSource([]);
  private columnKeyById: Map<string, string> = new Map();

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  public readonly csvResponseSelections: {key: CsvResultSelection; label: string}[] = [
    {key: 'success', label: 'Success'},
    {key: 'errors', label: 'Errors'},
    {key: 'ignored', label: 'Ignored'},
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CsvResultModalData,
    private dialogRef: MatDialogRef<CsvResultModalComponent>,
  ) {
    this.data.csvResult = this.normaliseResponse(data.csvResult);
    this.activeCsvResponseSelection = this.defaultSelection(this.data.csvResult);
    this.rebuildTableData();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public itemData(selection: CsvResultSelection): CsvRow[] {
    return this.data.csvResult[selection] ?? [];
  }

  public selectResponse(selection: CsvResultSelection): void {
    if (this.activeCsvResponseSelection === selection) {
      return;
    }

    this.activeCsvResponseSelection = selection;
    this.rebuildTableData();
  }

  public displayMessage(item: CsvRow): string {
    return item.message ?? item.error ?? '';
  }

  public rowValue(rowObject: Record<string, unknown> | null, key: string): string {
    if (!rowObject || !Object.prototype.hasOwnProperty.call(rowObject, key)) {
      return '';
    }

    return this.formatValue(rowObject[key]);
  }

  public headerForColumn(columnId: string): string {
    return this.columnKeyById.get(columnId) ?? columnId;
  }

  public rowValueForColumn(rowObject: Record<string, unknown> | null, columnId: string): string {
    const key = this.columnKeyById.get(columnId);
    if (!key) {
      return '';
    }

    return this.rowValue(rowObject, key);
  }

  public close(): void {
    this.dialogRef.close();
  }

  private defaultSelection(csvResult: CsvResult): CsvResultSelection {
    if ((csvResult.errors?.length ?? 0) > 0) {
      return 'errors';
    }
    if ((csvResult.success?.length ?? 0) > 0) {
      return 'success';
    }
    return 'ignored';
  }

  private normaliseResponse(csvResult: CsvResult): CsvResult {
    return {
      success: csvResult?.success ?? [],
      errors: csvResult?.errors ?? [],
      ignored: csvResult?.ignored ?? [],
    };
  }

  private rebuildTableData(): void {
    const items = this.itemData(this.activeCsvResponseSelection);
    const rowObjects = items.map((item) => this.toRowObject(item.row));
    const keyCounts: Map<string, number> = new Map();

    rowObjects.forEach((rowObject) => {
      if (!rowObject) {
        return;
      }

      Object.keys(rowObject).forEach((key) => {
        keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
      });
    });

    this.commonKeys = [...keyCounts.entries()]
      .filter(([, count]) => count === items.length)
      .map(([key]) => key)
      .sort((a, b) => a.localeCompare(b));

    this.dynamicColumnIds = this.commonKeys.map((_, index) => `csv_col_${index}`);
    this.columnKeyById.clear();
    this.dynamicColumnIds.forEach((columnId, index) => {
      this.columnKeyById.set(columnId, this.commonKeys[index]);
    });

    const displayRows = items.map((item, index) => {
      const rowObject = rowObjects[index];

      return {
        item,
        rowObject,
        otherData: this.buildOtherData(item.row, rowObject, this.commonKeys),
      };
    });

    const hasAnyOtherData = displayRows.some((row) => row.otherData.trim().length > 0);
    this.displayedColumns = hasAnyOtherData
      ? ['message', ...this.dynamicColumnIds, 'other']
      : ['message', ...this.dynamicColumnIds];
    this.dataSource.data = displayRows;
    this.paginator?.firstPage();
  }

  private buildOtherData(
    rawRow: unknown,
    rowObject: Record<string, unknown> | null,
    commonKeys: string[],
  ): string {
    if (!rowObject) {
      return this.formatValue(rawRow);
    }

    const commonKeySet = new Set(commonKeys);
    const additionalEntries = Object.entries(rowObject).filter(([key]) => !commonKeySet.has(key));
    if (additionalEntries.length === 0) {
      return '';
    }

    return additionalEntries
      .map(([key, value]) => `${key}: ${this.formatValue(value)}`)
      .join(' | ');
  }

  private toRowObject(row: unknown): Record<string, unknown> | null {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      return row as Record<string, unknown>;
    }

    // Some backend CSV imports return rows as [key, value][] tuples.
    // Convert those into an object so each key can become a table column.
    if (Array.isArray(row)) {
      const entries = row.filter(
        (entry): entry is [string, unknown] =>
          Array.isArray(entry) && entry.length >= 2 && typeof entry[0] === 'string',
      );

      if (entries.length === row.length && entries.length > 0) {
        return Object.fromEntries(entries);
      }
    }

    return null;
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return `${value}`;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return `${value}`;
    }
  }
}
