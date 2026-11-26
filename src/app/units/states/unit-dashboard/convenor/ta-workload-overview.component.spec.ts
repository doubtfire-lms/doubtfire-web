import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {User} from 'src/app/api/models/doubtfire-model';
import {TaWorkloadOverviewComponent} from './ta-workload-overview.component';

describe('TaWorkloadOverviewComponent', () => {
  const alex = {id: 1, name: 'Alex'};
  const sam = {id: 2, name: 'Sam'};
  const staff = [alex, sam].map((user) => ({role: 'Tutor', user}));
  let fixture: ComponentFixture<TaWorkloadOverviewComponent>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaWorkloadOverviewComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TaWorkloadOverviewComponent);
    page = fixture.nativeElement;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function rows(): string[][] {
    return Array.from(page.querySelectorAll('tbody tr'), (row) =>
      Array.from(row.querySelectorAll('th, td'), (cell) => cell.textContent.trim()),
    );
  }

  it('counts distinct students across non-tutorial sessions for each TA', () => {
    const sessions = [
      {user: alex, durationMinutes: 10, assessedProjectIds: [11]},
      {user: alex, durationMinutes: 20, assessedProjectIds: [11, 12]},
      {user: alex, durationMinutes: 60, assessedProjectIds: [13], duringTutorial: true},
      {user: sam, durationMinutes: 8, assessedProjectIds: [11]},
    ];
    fixture.componentRef.setInput('unit', {staff, getUserMarkingSessions: () => of(sessions)});
    fixture.detectChanges();

    expect(rows()).toEqual([
      ['Alex', '0h 30m', '2', '15 min'],
      ['Sam', '0h 8m', '1', '8 min'],
    ]);
  });

  it('shows inactive TAs with zero totals and no average', () => {
    fixture.componentRef.setInput('unit', {staff, getUserMarkingSessions: () => of([])});
    fixture.detectChanges();

    expect(rows()).toEqual([
      ['Alex', '0h 0m', '0', '—'],
      ['Sam', '0h 0m', '0', '—'],
    ]);
  });

  it('navigates between the current week and the week containing the unit start', () => {
    vi.useFakeTimers({toFake: ['Date']});
    vi.setSystemTime(new Date(2026, 10, 20, 12));
    const getUserMarkingSessions = vi.fn(() => of([]));
    fixture.componentRef.setInput('unit', {
      staff,
      startDate: new Date(2026, 10, 11),
      getUserMarkingSessions,
    });
    fixture.detectChanges();

    const previous = page.querySelector<HTMLButtonElement>('button[aria-label="Previous week"]');
    const next = page.querySelector<HTMLButtonElement>('button[aria-label="Next week"]');
    const dates = page.querySelector('header p');
    expect(dates.textContent.trim()).toBe('16 Nov 2026 – 22 Nov 2026');
    expect(next.disabled).toBe(true);
    expect(previous.disabled).toBe(false);

    previous.click();
    fixture.detectChanges();
    expect(dates.textContent.trim()).toBe('9 Nov 2026 – 15 Nov 2026');
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    next.click();
    fixture.detectChanges();
    expect(dates.textContent.trim()).toBe('16 Nov 2026 – 22 Nov 2026');
    expect(next.disabled).toBe(true);
    const currentWeek = [new Date(2026, 10, 16), new Date(2026, 10, 22), User.browserTimezone];
    expect(getUserMarkingSessions.mock.calls).toEqual([
      currentWeek,
      [new Date(2026, 10, 9), new Date(2026, 10, 15), User.browserTimezone],
      currentWeek,
    ]);
  });
});
