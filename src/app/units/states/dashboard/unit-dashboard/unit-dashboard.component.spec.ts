import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UnitDashboardComponent} from './unit-dashboard.component';

describe('UnitDashboardComponent', () => {
  let fixture: ComponentFixture<UnitDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [UnitDashboardComponent]}).compileComponents();
    fixture = TestBed.createComponent(UnitDashboardComponent);
    fixture.detectChanges();
  });

  it('renders the static dashboard without data services', () => {
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Ready for feedback');
    expect(page.textContent).toContain('Needs help');
    expect(page.textContent).toContain('Feedback overdue');
    expect(page.textContent).toContain('— unread messages');
    expect(page.querySelector('button')?.disabled).toBe(true);
    expect(page.querySelector('a')).toBeNull();
  });
});
