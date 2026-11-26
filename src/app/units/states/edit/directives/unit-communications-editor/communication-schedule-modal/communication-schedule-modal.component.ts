import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {
  Campus,
  CampusService,
  CommunicationSetSchedule,
  Unit,
} from 'src/app/api/models/doubtfire-model';

export interface CommunicationScheduleModalData {
  schedule?: CommunicationSetSchedule;
  unit?: Unit;
}

export const SCHEDULE_WEEKDAYS = [
  {value: 0, label: 'Sunday', shortLabel: 'Sun'},
  {value: 1, label: 'Monday', shortLabel: 'Mon'},
  {value: 2, label: 'Tuesday', shortLabel: 'Tue'},
  {value: 3, label: 'Wednesday', shortLabel: 'Wed'},
  {value: 4, label: 'Thursday', shortLabel: 'Thu'},
  {value: 5, label: 'Friday', shortLabel: 'Fri'},
  {value: 6, label: 'Saturday', shortLabel: 'Sat'},
] as const;

@Component({
  selector: 'f-communication-schedule-modal',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './communication-schedule-modal.component.html',
})
export class CommunicationScheduleModalComponent implements OnInit {
  readonly weekdays = SCHEDULE_WEEKDAYS;
  campuses: Campus[] = [];
  timezonePlaceholder = 'UTC';
  draft = new CommunicationSetSchedule({
    name: 'Schedule 1',
    active: true,
    anchor_week: 1,
    anchor_day: 'Monday',
    recurrence: 'none',
    interval: 1,
    timezone: 'UTC',
    hour: 8,
    minute: 0,
  });
  untilDateTime = '';

  constructor(
    private campusService: CampusService,
    public dialogRef: MatDialogRef<CommunicationScheduleModalComponent, CommunicationSetSchedule>,
    @Inject(MAT_DIALOG_DATA) public data: CommunicationScheduleModalData,
  ) {
    if (data.schedule) {
      this.draft = new CommunicationSetSchedule({
        ...data.schedule,
      });
    }

    this.untilDateTime = this.asDateTimeLocal(this.draft.until_at);
  }

  ngOnInit(): void {
    this.campusService.query().subscribe((campuses) => {
      this.campuses = campuses;
      const defaultTimezone = campuses[0]?.timezone;
      if (!defaultTimezone) {
        return;
      }

      this.timezonePlaceholder = defaultTimezone;
      if (!this.draft.timezone || this.draft.timezone === 'UTC') {
        this.draft.timezone = defaultTimezone;
      }
    });
  }

  canSave(): boolean {
    return !!this.draft.anchor_week && !!this.draft.anchor_day;
  }

  save(): void {
    const schedule = new CommunicationSetSchedule({
      ...this.draft,
      name: this.draft.name?.trim() || 'Untitled schedule',
      until_at: this.untilDateTime || undefined,
      anchor_week: Math.max(1, Number(this.draft.anchor_week || 1)),
      anchor_day: this.draft.anchor_day || 'Monday',
      hour: this.safeHour(),
      minute: this.safeMinute(),
    });

    schedule.ice_cube_schedule = this.toIceCubePayload(schedule);
    this.dialogRef.close(schedule);
  }

  scheduleSummary(): string {
    const parts: string[] = [];
    parts.push(
      `Starts Week ${this.draft.anchor_week || 1} ${this.draft.anchor_day || 'Monday'} at ${this.timeLabel(this.safeHour(), this.safeMinute())}`,
    );

    switch (this.draft.recurrence) {
      case 'daily':
        parts.push(`Repeats every ${this.draft.interval || 1} day(s)`);
        break;
      case 'weekly':
        parts.push(`Repeats every ${this.draft.interval || 1} week(s)`);
        break;
      case 'monthly':
        parts.push(`Repeats every ${this.draft.interval || 1} month(s)`);
        break;
      default:
        parts.push('Runs once');
    }

    if (this.draft.repeat_count) {
      parts.push(`up to ${this.draft.repeat_count} times`);
    }
    if (this.untilDateTime) {
      parts.push(`until ${this.untilDateTime}`);
    }

    return parts.join(' | ');
  }

  iceCubePreview(): string {
    return JSON.stringify(this.toIceCubePayload(this.draft), null, 2);
  }

  private safeHour(): number {
    return Math.min(23, Math.max(0, Number(this.draft.hour ?? 8)));
  }

  private safeMinute(): number {
    return Math.min(59, Math.max(0, Number(this.draft.minute ?? 0)));
  }

  private toIceCubePayload(schedule: CommunicationSetSchedule): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      timezone: schedule.timezone || 'UTC',
      anchor: this.anchorPayload(schedule),
      recurrence: schedule.recurrence,
      interval: schedule.interval || 1,
      limits: {
        count: schedule.repeat_count || null,
        until: schedule.until_at || null,
      },
      rules: [],
    };

    const rules = payload.rules as Record<string, unknown>[];
    switch (schedule.recurrence) {
      case 'daily':
        rules.push({
          type: 'daily',
          interval: schedule.interval || 1,
        });
        break;
      case 'weekly':
        rules.push({
          type: 'weekly',
          interval: schedule.interval || 1,
        });
        break;
      case 'monthly':
        rules.push({
          type: 'monthly',
          interval: schedule.interval || 1,
        });
        break;
      default:
        rules.push({type: 'one_off'});
    }

    return payload;
  }

  private anchorPayload(schedule: CommunicationSetSchedule): Record<string, unknown> {
    return {
      week: schedule.anchor_week || 1,
      day: schedule.anchor_day || 'Monday',
      time_of_day: this.timeLabel(schedule.hour || 0, schedule.minute || 0),
    };
  }

  private asDateTimeLocal(value?: string): string {
    if (!value) {
      return '';
    }
    return value.length >= 16 ? value.slice(0, 16) : value;
  }

  private timeLabel(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
}
