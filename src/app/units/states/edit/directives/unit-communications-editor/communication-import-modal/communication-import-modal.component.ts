import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {
  CommunicationImportReport,
  CommunicationRuleService,
  CommunicationSet,
  CommunicationSetService,
} from 'src/app/api/models/doubtfire-model';

export interface CommunicationImportModalData {
  unitId: number;
  /** Present when importing a rule into an existing set; absent for a set import. */
  set?: CommunicationSet;
}

export interface CommunicationImportModalResult {
  report: CommunicationImportReport;
  importedSetId?: number;
}

/**
 * Two-step import: the document is always dry run first so the conditions and
 * actions that will not resolve in this unit are shown before anything is
 * written. Confirming replays the same document for real.
 */
@Component({
  selector: 'f-communication-import-modal',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './communication-import-modal.component.html',
})
export class CommunicationImportModalComponent {
  fileName = '';
  documentText = '';
  document?: Record<string, unknown>;
  report?: CommunicationImportReport;
  errorMessage = '';
  busy = false;

  constructor(
    private setService: CommunicationSetService,
    private ruleService: CommunicationRuleService,
    public dialogRef: MatDialogRef<
      CommunicationImportModalComponent,
      CommunicationImportModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: CommunicationImportModalData,
  ) {}

  get importingRule(): boolean {
    return !!this.data.set;
  }

  get title(): string {
    return this.importingRule
      ? `Import rule into ${this.data.set.name}`
      : 'Import communication set';
  }

  get expectedFormat(): string {
    return this.importingRule ? 'ontrack.communication_rule' : 'ontrack.communication_set';
  }

  get canCheck(): boolean {
    return !this.busy && this.documentText.trim().length > 0;
  }

  get canImport(): boolean {
    return !this.busy && !!this.report;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.fileName = file.name;
    file.text().then((text) => {
      this.documentText = text;
      this.check();
    });
  }

  /** Dry run: report what the import would do without writing anything. */
  check(): void {
    this.report = undefined;
    this.errorMessage = '';

    if (!this.parseDocument()) {
      return;
    }

    this.busy = true;
    this.request(true).subscribe({
      next: (response) => {
        this.busy = false;
        this.report = response.report;
      },
      error: (error) => {
        this.busy = false;
        this.errorMessage = this.messageFor(error);
      },
    });
  }

  confirm(): void {
    if (!this.document) {
      return;
    }

    this.busy = true;
    this.errorMessage = '';
    this.request(false).subscribe({
      next: (response) => {
        this.busy = false;
        this.dialogRef.close({
          report: response.report,
          importedSetId: this.importingRule ? this.data.set.id : response.report.imported_id,
        });
      },
      error: (error) => {
        this.busy = false;
        this.errorMessage = this.messageFor(error);
      },
    });
  }

  private request(dryRun: boolean): Observable<{report: CommunicationImportReport}> {
    return this.importingRule
      ? this.ruleService.importForSet(this.data.unitId, this.data.set.id, this.document, dryRun)
      : this.setService.importForUnit(this.data.unitId, this.document, dryRun);
  }

  private parseDocument(): boolean {
    try {
      const parsed = JSON.parse(this.documentText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        this.errorMessage = 'That file does not contain an OnTrack communication document.';
        return false;
      }

      this.document = parsed as Record<string, unknown>;
      return true;
    } catch {
      this.errorMessage = 'That file is not valid JSON.';
      return false;
    }
  }

  private messageFor(error: unknown): string {
    const response = error as {error?: {error?: string}; message?: string};
    return response?.error?.error || response?.message || 'The import could not be completed.';
  }
}
