import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ExtensionSummaryPayload} from 'src/app/units/states/tasks/staff-grant-extension/models/extension-results.model';

@Component({
  selector: 'f-staff-grant-extension-summary',
  templateUrl: './staff-grant-extension-summary.component.html',
  styleUrls: ['./staff-grant-extension-summary.component.scss'],
  standalone: false,
})
export class StaffGrantExtensionSummaryComponent {
  @Input() summary!: ExtensionSummaryPayload;
  @Output() dismissed: EventEmitter<void> = new EventEmitter();

  get successCount(): number {
    return this.summary.results?.successful?.length ?? 0;
  }

  get failedCount(): number {
    return this.summary.results?.failed?.length ?? 0;
  }

  get skippedCount(): number {
    return this.summary.results?.skipped?.length ?? 0;
  }

  dismiss(): void {
    this.dismissed.emit();
  }
}
