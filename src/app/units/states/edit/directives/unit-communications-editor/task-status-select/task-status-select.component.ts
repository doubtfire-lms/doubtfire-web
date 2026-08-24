import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import {TaskStatus, TaskStatusEnum} from 'src/app/api/models/task-status';

interface TaskStatusGroup {
  key: string;
  label: string;
  statuses: TaskStatusEnum[];
}

/**
 * Multi select of task statuses, with a group of shortcuts that select/deselect a
 * whole category of statuses at once. Groups are never part of the value - clicking
 * one simply toggles the statuses it stands for.
 */
@Component({
  selector: 'f-task-status-select',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './task-status-select.component.html',
})
export class TaskStatusSelectComponent implements OnChanges {
  @Input({required: true}) taskStatuses: string[];
  @Input() label = 'Statuses';
  @Output() taskStatusesChange: EventEmitter<string[]> = new EventEmitter();

  readonly statuses = TaskStatus.STATUS_KEYS;

  readonly groups: TaskStatusGroup[] = [
    {
      key: 'group:nothing_submitted',
      label: 'Nothing submitted',
      statuses: ['not_started', 'need_help', 'working_on_it'],
    },
    {
      key: 'group:submitted',
      label: 'In submitted state',
      statuses: TaskStatus.SUBMITTED_STATUSES,
    },
    {
      key: 'group:discussion',
      label: 'Discussion states',
      statuses: TaskStatus.DISCUSSION_STATES,
    },
    {
      key: 'group:marked',
      label: 'Marked statuses',
      statuses: TaskStatus.MARKED_STATUSES,
    },
  ];

  /**
   * The value bound to the select - the selected statuses, plus the key of every
   * group that is currently fully selected so that its checkbox reflects that.
   */
  selection: string[] = [];

  ngOnChanges(): void {
    this.selection = this.selectionFor(this.selectedStatuses());
  }

  onSelectionChange(values: string[]): void {
    const previous = new Set(this.selection);
    const next = new Set(values);
    const statuses = new Set(values.filter((value) => !this.isGroupKey(value)));

    for (const group of this.groups) {
      if (next.has(group.key) && !previous.has(group.key)) {
        group.statuses.forEach((status) => statuses.add(status));
      } else if (previous.has(group.key) && !next.has(group.key)) {
        group.statuses.forEach((status) => statuses.delete(status));
      }
    }

    const selected = this.statuses.filter((status) => statuses.has(status));
    this.selection = this.selectionFor(selected);
    this.taskStatusesChange.emit(selected);
  }

  statusLabel(status: string): string {
    return TaskStatus.STATUS_LABELS.get(status as TaskStatusEnum) ?? status;
  }

  triggerLabel(): string {
    const selected = this.selectedStatuses();

    if (selected.length === 0) {
      return '';
    }

    const group = this.groups.find(
      (item) =>
        item.statuses.length === selected.length &&
        item.statuses.every((status) => selected.includes(status)),
    );

    return group ? group.label : selected.map((status) => this.statusLabel(status)).join(', ');
  }

  private selectedStatuses(): TaskStatusEnum[] {
    const selected = new Set(this.taskStatuses ?? []);
    return this.statuses.filter((status) => selected.has(status));
  }

  private selectionFor(statuses: TaskStatusEnum[]): string[] {
    const activeGroups = this.groups
      .filter((group) => group.statuses.every((status) => statuses.includes(status)))
      .map((group) => group.key);

    return [...statuses, ...activeGroups];
  }

  private isGroupKey(value: string): boolean {
    return this.groups.some((group) => group.key === value);
  }
}
