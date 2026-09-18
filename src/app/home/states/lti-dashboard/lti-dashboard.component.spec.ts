import {Observable, of, throwError} from 'rxjs';
import {LtiDashboardComponent} from './lti-dashboard.component';

describe('LtiDashboardComponent grade setup', () => {
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
    const ltiService = {retryGradeLineItem: vi.fn(() => retryResult)};
    const alerts = {success: vi.fn(), error: vi.fn()};
    const component = new LtiDashboardComponent(
      {} as never,
      ltiService as never,
      {} as never,
      {} as never,
      alerts as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {ExternalName: of('OnTrack')} as never,
    );
    return {component, ltiService, alerts};
  }

  it('enables grade sync after retry resolves the line item', () => {
    const {component, ltiService, alerts} = buildComponent(of(configuredStatus));

    component.retryGradeLineItem();

    expect(ltiService.retryGradeLineItem).toHaveBeenCalledOnce();
    expect(component.gradeLineItemStatus).toEqual(configuredStatus);
    expect(component.isRetryingGradeLineItem).toBe(false);
    expect(alerts.success).toHaveBeenCalledWith('Moodle grade item is ready.', 5000);
  });

  it('keeps grade sync unavailable and exposes the retry error', () => {
    const {component, alerts} = buildComponent(
      throwError(() => 'Enable grade column management and retry.'),
    );

    component.retryGradeLineItem();

    expect(component.isRetryingGradeLineItem).toBe(false);
    expect(component.gradeLineItemStatus).toEqual({
      configured: false,
      visibility: 'unknown',
      message: 'Enable grade column management and retry.',
    });
    expect(alerts.error).toHaveBeenCalledWith('Enable grade column management and retry.', 6000);
  });
});
