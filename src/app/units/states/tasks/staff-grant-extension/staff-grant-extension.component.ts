import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {TaskDefinition, Unit} from 'src/app/api/models/doubtfire-model';
import {ExtensionSummaryPayload} from 'src/app/units/states/tasks/staff-grant-extension/models/extension-results.model';

@Component({
  selector: 'f-staff-grant-extension',
  templateUrl: './staff-grant-extension.component.html',
  styleUrls: ['./staff-grant-extension.component.scss'],
  standalone: false,
})
export class StaffGrantExtensionComponent implements OnInit, OnDestroy {
  unit?: Unit;

  selectedTaskDefinition$: BehaviorSubject<TaskDefinition> = new BehaviorSubject(null);
  selectedTaskDefinition: TaskDefinition | null = null;
  isFormActive = false;
  unitId?: number;
  taskDefinitionId?: number;

  extensionSummary?: ExtensionSummaryPayload | null = null;
  showSummary = false;
  extensionSummaries: Map<number, ExtensionSummaryPayload> = new Map();

  private destroy$: Subject<void> = new Subject();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.selectedTaskDefinition$.pipe(takeUntil(this.destroy$)).subscribe((taskDef) => {
      this.selectedTaskDefinition = taskDef;
      this.isFormActive = !!taskDef;
      this.taskDefinitionId = taskDef?.id;
      const saved = taskDef ? this.extensionSummaries.get(taskDef.id) : null;
      this.extensionSummary = saved ?? null;
      this.showSummary = !!saved;
    });

    this.route.parent?.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const unit = data['unit'] as Unit;
      if (this.unitId !== unit.id) {
        this.extensionSummaries.clear();
        this.selectedTaskDefinition$.next(null);
      }
      this.unit = unit;
      this.unitId = unit.id;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Called when child emits extensionResult
  onExtensionResult(payload: ExtensionSummaryPayload): void {
    const tdId = payload.taskDefinitionId ?? this.taskDefinitionId;
    if (!tdId) {
      return;
    }

    // Always clear the previous one
    this.extensionSummaries.delete(tdId);

    // Temporarily hide the summary
    this.extensionSummary = null;
    this.showSummary = false;

    // Save the payload for that specific task
    this.extensionSummaries.set(tdId, payload);

    if (this.selectedTaskDefinition && this.selectedTaskDefinition.id === tdId) {
      setTimeout(() => {
        this.extensionSummary = payload;
        this.showSummary = true;
      }, 0);
    }
  }

  onSummaryDismissed(): void {
    const tdId = this.extensionSummary?.taskDefinitionId ?? this.selectedTaskDefinition?.id;
    if (tdId) {
      this.extensionSummaries.delete(tdId);
    }

    this.showSummary = false;
    this.extensionSummary = null;
  }
}
