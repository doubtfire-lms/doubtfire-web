import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {ProjectService, TaskService} from 'src/app/api/models/doubtfire-model';
import {NotificationService} from 'src/app/api/services/notification.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {UnitDashboardComponent} from './unit-dashboard.component';

describe('UnitDashboardComponent', () => {
  let fixture: ComponentFixture<UnitDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitDashboardComponent],
      providers: [
        provideRouter([]),
        {provide: ActivatedRoute, useValue: {parent: {data: of({})}}},
        {provide: ProjectService, useValue: {}},
        {provide: TaskService, useValue: {}},
        {provide: NotificationService, useValue: {}},
        {provide: AlertService, useValue: {}},
        {provide: GlobalStateService, useValue: {}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UnitDashboardComponent);
    fixture.detectChanges();
  });

  it('renders the dashboard loading state before a unit is available', () => {
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Ready for feedback');
    expect(page.textContent).toContain('Needs help');
    expect(page.textContent).toContain('Feedback overdue');
    expect(page.textContent).toContain('... unread messages');
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Loading weekly summary');
    expect(page.querySelector('a[href] button')?.textContent).toContain('Open inbox');
  });
});
