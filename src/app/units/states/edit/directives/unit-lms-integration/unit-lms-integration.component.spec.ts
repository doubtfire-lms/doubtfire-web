import {Observable, of, throwError} from 'rxjs';
import {LmsIntegration} from 'src/app/api/models/lms-integration';
import {Unit} from 'src/app/api/models/unit';
import {UnitLmsIntegrationComponent} from './unit-lms-integration.component';

describe('UnitLmsIntegrationComponent grade setup', () => {
  const configuredStatus = {
    configured: true,
    visibility: 'unknown' as const,
    lineItem: {
      id: 'https://moodle.test/lineitem/1',
      label: 'OnTrack',
      scoreMaximum: 100,
    },
  };

  function buildComponent(retryResult: Observable<unknown>) {
    const lmsService = {retryGradeLineItem: vi.fn(() => retryResult)};
    const alerts = {success: vi.fn(), error: vi.fn()};
    const changeDetector = {markForCheck: vi.fn()};
    const component = new UnitLmsIntegrationComponent(
      lmsService as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      alerts as never,
      changeDetector as never,
    );
    component.unit = {id: 42} as Unit;
    return {component, lmsService, alerts};
  }

  it('enables grade sync after retry resolves the line item', () => {
    const {component, lmsService, alerts} = buildComponent(of(configuredStatus));

    component.retryGradeLineItem();

    expect(lmsService.retryGradeLineItem).toHaveBeenCalledWith(42);
    expect(component.gradeLineItem).toEqual(configuredStatus);
    expect(component.retryingGradeLineItem).toBe(false);
    expect(alerts.success).toHaveBeenCalledWith('LMS grade item is ready.');
  });

  it('keeps grade sync unavailable and exposes the retry error', () => {
    const {component, alerts} = buildComponent(
      throwError(() => ({error: {error: 'Enable grade column management and retry.'}})),
    );

    component.retryGradeLineItem();

    expect(component.retryingGradeLineItem).toBe(false);
    expect(component.gradeLineItemError).toBe('Enable grade column management and retry.');
    expect(alerts.error).toHaveBeenCalledWith('Enable grade column management and retry.');
  });
});

describe('UnitLmsIntegrationComponent setting toggles', () => {
  function buildComponent(updateResult: Observable<LmsIntegration>) {
    const lmsService = {updateToggle: vi.fn(() => updateResult)};
    const alerts = {success: vi.fn(), error: vi.fn()};
    const component = new UnitLmsIntegrationComponent(
      lmsService as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      alerts as never,
      {markForCheck: vi.fn()} as never,
    );
    component.unit = {id: 42} as Unit;
    component.integration = new LmsIntegration(component.unit);
    return {component, lmsService, alerts};
  }

  it('saves a toggle without leaving unsaved changes', () => {
    const saved = new LmsIntegration({id: 42} as Unit);
    saved.autoSyncStudents = true;
    const {component, lmsService, alerts} = buildComponent(of(saved));

    component.saveToggle('autoSyncStudents', true);

    expect(lmsService.updateToggle).toHaveBeenCalledWith(
      component.integration,
      'autoSyncStudents',
      true,
    );
    expect(component.integration.autoSyncStudents).toBe(true);
    expect(component.groupMappingsDirty).toBe(false);
    expect(component.togglesSaving.size).toBe(0);
    expect(alerts.success).toHaveBeenCalledWith('Sync students daily turned on.');
  });

  it('reverts the toggle when saving fails', () => {
    const {component, alerts} = buildComponent(
      throwError(() => ({error: {error: 'Not authorised'}})),
    );

    component.saveToggle('withdrawMissingStudents', true);

    expect(component.integration.withdrawMissingStudents).toBe(false);
    expect(alerts.error).toHaveBeenCalledWith(
      "Couldn't update withdraw missing students: Not authorised",
    );
  });

  it('saves the portfolio assignment and closes the editor', () => {
    const saved = new LmsIntegration({id: 42} as Unit);
    saved.assignmentId = 7;
    saved.assignmentName = 'Portfolio';
    const lmsService = {
      updateAssignment: vi.fn(() => of(saved)),
      validateIntegration: vi.fn(() =>
        of({
          valid: true,
          validated_at: '2026-09-18T00:00:00Z',
          groups: [],
          assignments: [],
          issues: [],
        }),
      ),
    };
    const alerts = {success: vi.fn(), error: vi.fn()};
    const component = new UnitLmsIntegrationComponent(
      lmsService as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      alerts as never,
      {markForCheck: vi.fn()} as never,
    );
    component.unit = {id: 42} as Unit;
    component.integration = new LmsIntegration(component.unit);
    component.assignments = [{id: 7, name: 'Portfolio', dueDate: 0}];
    component.assignmentDraftId = 7;

    component.saveAssignment();

    expect(lmsService.updateAssignment).toHaveBeenCalledWith(component.integration, 7, 'Portfolio');
    expect(component.integration.assignmentId).toBe(7);
    expect(component.assignmentEditorOpen).toBe(false);
    expect(alerts.success).toHaveBeenCalledWith('Portfolio assignment saved.');
    expect(lmsService.validateIntegration).toHaveBeenCalledWith(42);
    expect(component.integration.validated).toBe(true);
  });
});
