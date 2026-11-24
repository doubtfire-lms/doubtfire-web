import {beforeEach, describe, expect, it} from 'vitest';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSelectHarness} from '@angular/material/select/testing';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {BehaviorSubject, NEVER, of} from 'rxjs';
import {
  ProjectService,
  TaskService,
  Tutorial,
  Unit,
  UnitRole,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {NotificationService} from 'src/app/api/services/notification.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {UnitDashboardComponent} from './unit-dashboard.component';

describe('UnitDashboardComponent', () => {
  let fixture: ComponentFixture<UnitDashboardComponent>;
  let routeData: BehaviorSubject<{unit?: Unit}>;
  let currentView: BehaviorSubject<{entity: UnitRole} | null>;

  beforeEach(async () => {
    routeData = new BehaviorSubject<{unit?: Unit}>({});
    currentView = new BehaviorSubject<{entity: UnitRole} | null>(null);

    await TestBed.configureTestingModule({
      imports: [UnitDashboardComponent],
      providers: [
        provideRouter([]),
        {provide: ActivatedRoute, useValue: {parent: {data: routeData}}},
        {provide: ProjectService, useValue: {loadStudents: () => NEVER}},
        {provide: TaskService, useValue: {getOverflowAvailableToClaimCount: () => NEVER}},
        {provide: UserService, useValue: {currentUser: {id: 10}}},
        {
          provide: NotificationService,
          useValue: {getNotifications: () => NEVER, getStaffWeeklySummary: () => NEVER},
        },
        {provide: AlertService, useValue: {}},
        {provide: GlobalStateService, useValue: {currentViewAndEntitySubject$: currentView}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UnitDashboardComponent);
  });

  function openDashboard(role: string, assigned = true): HTMLElement {
    const unit = Object.assign(new Unit(), {id: 1, getUserMarkingSessions: () => of([])});
    unit.getTaskTurnaround = () => of({unit_id: 1, task_definitions: []});
    const viewer = Object.assign(new UnitRole(), {
      unit,
      role,
      observerOnly: !assigned && role === 'Convenor',
      user: {id: 10, name: 'Alex Lee'},
    });
    if (assigned) {
      viewer.id = 1;
      unit.staffCache.add(viewer);
    }
    unit.staffCache.add(
      Object.assign(new UnitRole(), {
        id: 7,
        unit,
        role: 'Tutor',
        user: {id: 70, name: 'Sam Wu'},
        canMarkOverflowTasks: true,
      }),
    );
    currentView.next({entity: viewer});
    routeData.next({unit});
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('renders the tutor dashboard loading state for a tutor', () => {
    const page = openDashboard('Tutor');

    expect(page.querySelector('button[aria-pressed="true"]')?.textContent).toContain('Tutor');
    expect(page.textContent).toContain('Ready for feedback');
    expect(page.textContent).toContain('Needs help');
    expect(page.textContent).toContain('Feedback overdue');
    expect(page.textContent).toContain('... unread messages');
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Loading weekly summary');
    expect(page.querySelector('f-open-inbox-button a[href]')?.textContent).toContain('Open inbox');
  });

  it.each([
    {kind: 'assigned', assigned: true},
    {kind: 'synthetic', assigned: false},
  ])(
    'lets a $kind convenor view a tutor’s dashboard and inbox links, then return to their own',
    async ({assigned}) => {
      const page = openDashboard('Convenor', assigned);
      const selector = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);
      expect(await selector.getValueText()).toBe('Myself');
      await selector.open();
      const options = await selector.getOptions();
      expect(await Promise.all(options.map((option) => option.getText()))).toEqual([
        'Myself',
        'Sam Wu',
      ]);
      await options[1].click();

      expect(await selector.getValueText()).toBe('Sam Wu');
      expect(page.querySelector('button[aria-pressed="true"]')?.textContent).toContain('Tutor');
      expect(page.textContent).toContain('Sam Wu’s roles');
      expect(page.textContent).toContain('Overflow tutor');
      expect(page.querySelector('f-convenor')).toBeNull();
      const inboxLinks = page.querySelectorAll<HTMLAnchorElement>('f-tutor-dashboard a[href]');
      expect(inboxLinks).toHaveLength(4);
      for (const link of inboxLinks) {
        const params = new URL(link.href).searchParams;
        expect(params.get('viewAsUnitRoleId')).toBe('7');
        expect(params.get('students')).toBe('mine');
      }

      await selector.clickOptions({text: 'Myself'});
      expect(await selector.getValueText()).toBe('Myself');
      expect(page.querySelector('button[aria-pressed="true"]')?.textContent).toContain('Convenor');
      expect(page.querySelector('f-convenor')).not.toBeNull();
      expect(page.textContent).toContain('Your roles');
      expect(page.querySelector('a[href*="viewAsUnitRoleId"]')).toBeNull();
    },
  );

  it('keeps a teaching convenor selected when switching dashboards', async () => {
    const page = openDashboard('Convenor');
    const {unit} = routeData.value;
    const staff = unit.staff.find((role) => role.id === 7);
    staff.role = 'Convenor';
    unit.tutorialsCache.add(Object.assign(new Tutorial(unit), {id: 8, tutor: staff.user}));

    const selector = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);
    await selector.clickOptions({text: 'Sam Wu'});
    expect(page.querySelector('f-convenor')).not.toBeNull();
    const roleButton = (label: string) =>
      Array.from(page.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')).find(
        (button) => button.textContent.trim() === label,
      );
    roleButton('Tutor').click();
    fixture.detectChanges();
    expect(page.querySelector('f-tutor-dashboard')).not.toBeNull();
    expect(await selector.getValueText()).toBe('Sam Wu');
    roleButton('Convenor').click();
    fixture.detectChanges();
    expect(page.querySelector('f-convenor')).not.toBeNull();
    expect(page.querySelector('f-open-inbox-button a')?.getAttribute('href')).toContain(
      'viewAsUnitRoleId=7',
    );
  });

  it.each([
    ['Tutor', true],
    ['Admin', false],
    ['Auditor', false],
  ] as const)('hides staff selection for %s (assigned: %s)', (role, assigned) => {
    const page = openDashboard(role, assigned);
    expect(page.querySelector('mat-select')).toBeNull();
    expect(page.querySelector('a[href*="viewAsUnitRoleId"]')).toBeNull();
  });

  it('renders the convenor view and a plain moderator badge for a convenor', () => {
    const page = openDashboard('Convenor');

    expect(page.querySelector('button[aria-pressed="true"]')?.textContent).toContain('Convenor');
    expect(page.querySelector('f-convenor#convenor-dashboard')).not.toBeNull();
    expect(page.textContent).toContain('Moderator');
    expect(page.querySelectorAll('button[aria-pressed]')).toHaveLength(1);
    expect(page.querySelector('f-tutor-dashboard')).toBeNull();
  });
});
