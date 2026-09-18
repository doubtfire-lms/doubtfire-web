import {Observable, of, throwError} from 'rxjs';
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
