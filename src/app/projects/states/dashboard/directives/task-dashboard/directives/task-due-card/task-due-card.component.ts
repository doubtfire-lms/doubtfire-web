import {formatDate} from '@angular/common';
import {ChangeDetectionStrategy, Component, Inject, Input, LOCALE_ID} from '@angular/core';
import {Task} from 'src/app/api/models/task';

@Component({
  selector: 'f-task-due-card',
  templateUrl: './task-due-card.component.html',
  styleUrls: ['./task-due-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDueCardComponent {
  @Input() task: Task;

  constructor(@Inject(LOCALE_ID) private readonly locale: string) {}

  public get flexibleDatesEnabled(): boolean {
    return this.task?.unit?.allowFlexibleDates;
  }

  public get discussTimeoutExpiryDate(): string | null {
    const expiryDate = this.task?.discussTimeoutExpiryDate;
    if (this.task?.status !== 'discuss' || !expiryDate) {
      return null;
    }

    const day = expiryDate.getDate();
    const suffix = day >= 11 && day <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][day % 10] ?? 'th');
    const includeYear = expiryDate.getFullYear() !== new Date().getFullYear();
    const monthAndYear = formatDate(expiryDate, includeYear ? 'MMMM y' : 'MMMM', this.locale);

    return `${day}${suffix} ${monthAndYear}`;
  }
}
