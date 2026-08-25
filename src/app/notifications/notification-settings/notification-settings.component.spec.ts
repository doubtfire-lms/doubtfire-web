import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {NotificationSettingsComponent} from './notification-settings.component';

describe('NotificationSettingsComponent', () => {
  let component: NotificationSettingsComponent;
  let fixture: ComponentFixture<NotificationSettingsComponent>;
  const running = (id: number, code: string) => ({
    id,
    code,
    name: `Unit ${code}`,
    active: true,
    startDate: new Date(Date.now() - 86_400_000),
    endDate: new Date(Date.now() + 86_400_000),
  });
  const finished = (id: number, code: string) => ({
    ...running(id, code),
    startDate: new Date(Date.now() - 4 * 86_400_000),
    endDate: new Date(Date.now() - 2 * 86_400_000),
  });

  let unitRoles: BehaviorSubject<unknown[]>;
  let projects: BehaviorSubject<unknown[]>;

  const build = async (isStaff = false) => {
    unitRoles = new BehaviorSubject<unknown[]>([{unit: running(1, 'COS10009')}]);
    projects = new BehaviorSubject<unknown[]>([{unit: running(2, 'COS20007')}]);

    await TestBed.configureTestingModule({
      declarations: [NotificationSettingsComponent],
      providers: [
        {
          provide: GlobalStateService,
          useValue: {
            unitRolesSubject: unitRoles.asObservable(),
            projectsSubject: projects.asObservable(),
          },
        },
        {provide: UserService, useValue: {currentUser: {isStaff}}},
        {provide: AlertService, useValue: {error: vi.fn(), success: vi.fn()}},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    await build();
  });

  it('puts "All units" first, then a tab per unit, sorted by code', () => {
    expect(component.scopes.map((scope) => scope.code)).toEqual([
      'All units',
      'COS10009',
      'COS20007',
    ]);
    expect(component.scopes[0].unitId).toBeNull();
  });

  it('drops units that are not currently running', () => {
    projects.next([{unit: finished(2, 'COS20007')}, {unit: running(3, 'COS30045')}]);

    expect(component.scopes.map((scope) => scope.code)).toEqual([
      'All units',
      'COS10009',
      'COS30045',
    ]);
  });

  it('drops units flagged inactive even while inside their dates', () => {
    projects.next([{unit: {...running(2, 'COS20007'), active: false}}]);

    expect(component.scopes.map((scope) => scope.code)).toEqual(['All units', 'COS10009']);
  });

  it('lists a unit once when the user both teaches and studies it', () => {
    projects.next([{unit: running(1, 'COS10009')}]);

    expect(component.scopes.map((scope) => scope.code)).toEqual(['All units', 'COS10009']);
  });

  it('keeps edits when the unit caches emit again', () => {
    component.selectedIndex = 1;
    component.customise();
    component.setChannel('new_task_comment', 'email', false);

    projects.next([{unit: running(2, 'COS20007')}, {unit: running(3, 'COS30045')}]);

    expect(component.scopes[1].customised).toBe(true);
    expect(component.isChecked('new_task_comment', 'email')).toBe(false);
  });

  it('hides moderation notes from students and shows them to staff', async () => {
    expect(component.sections.map((section) => section.key)).not.toContain('moderation');

    TestBed.resetTestingModule();
    await build(true);
    expect(component.sections.map((section) => section.key)).toContain('moderation');
  });

  it('hides the type sections on a unit that still follows "All units"', () => {
    component.selectedIndex = 1;

    expect(component.showsSections).toBe(false);
    expect(component.showsInheritanceBanner).toBe(true);

    // Edits are refused while there is nothing on screen to edit.
    component.setChannel('new_task_comment', 'email', false);
    expect(component.isChecked('new_task_comment', 'email')).toBe(true);
  });

  it('shows the type sections once a unit is customised', () => {
    component.selectedIndex = 1;
    component.customise();

    expect(component.showsSections).toBe(true);
    expect(component.showsInheritanceBanner).toBe(true);
  });

  it('hides the sections and the banner while a unit is muted', () => {
    component.selectedIndex = 1;
    component.customise();
    component.muteChanged(true);

    expect(component.showsSections).toBe(false);
    expect(component.showsInheritanceBanner).toBe(false);
  });

  it('always shows the sections on the "All units" tab', () => {
    expect(component.isGlobalScope).toBe(true);
    expect(component.showsSections).toBe(true);
    expect(component.showsInheritanceBanner).toBe(false);
  });

  it('copies the current "All units" values when a unit is customised', () => {
    component.selectedIndex = 1;
    component.scopes[0].channels['new_task_comment'].email = false;

    component.customise();

    expect(component.isEditable).toBe(true);
    expect(component.isChecked('new_task_comment', 'email')).toBe(false);

    // The copy is independent - later global changes no longer reach this unit.
    component.scopes[0].channels['new_task_comment'].email = true;
    expect(component.isChecked('new_task_comment', 'email')).toBe(false);
  });

  it('follows "All units" again after a reset', () => {
    component.selectedIndex = 1;
    component.customise();
    component.setChannel('new_task_comment', 'email', false);

    component.resetToGlobal();

    expect(component.scopes[1].customised).toBe(false);
    expect(component.showsSections).toBe(false);
    expect(component.isChecked('new_task_comment', 'email')).toBe(true);
  });

  it('does not fork a unit that is only muted', () => {
    component.selectedIndex = 1;

    component.muteChanged(true);
    expect(component.scopes[1].muted).toBe(true);
    expect(component.scopes[1].customised).toBe(false);

    // Unmuting leaves the unit following "All units", as it was before.
    component.muteChanged(false);
    expect(component.showsSections).toBe(false);
    expect(component.showsInheritanceBanner).toBe(true);
  });

  it('reports having no current units', () => {
    unitRoles.next([]);
    projects.next([]);

    expect(component.hasUnits).toBe(false);
    expect(component.loading).toBe(false);
  });
});
