import {addDays, startOfWeek} from 'date-fns';

export const calendarDate = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function mondayOf(date: Date): Date {
  return startOfWeek(date, {weekStartsOn: 1});
}

export function weekLabel(monday: Date): string {
  return `${calendarDate.format(monday)} – ${calendarDate.format(addDays(monday, 6))}`;
}

export function formatDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
