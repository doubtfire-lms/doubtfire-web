import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SimpleChange} from '@angular/core';
import {of} from 'rxjs';
import {Unit} from 'src/app/api/models/doubtfire-model';
import {UnitContentViewerComponent} from './unit-content-viewer.component';

describe('UnitContentViewerComponent', () => {
  const unitId = 42;
  const siteId = 7;
  const contentVersion = 'a'.repeat(64);
  let component: UnitContentViewerComponent;

  beforeEach(() => {
    component = new UnitContentViewerComponent(
      {prepareContentAccess: vi.fn(() => of(undefined))} as never,
      {} as never,
      {} as never,
      {
        currentUserProjects: {currentValues: []},
        setView: vi.fn(),
      } as never,
      {} as never,
      {} as never,
    );
  });

  it('uses the site content version in file URLs', async () => {
    setContentContext();

    const url = await (
      component as unknown as {
        contentUrl: (unitId: number, route: string) => Promise<string>;
      }
    ).contentUrl(unitId, '/section/page');

    expect(url).toContain(
      `/units/${unitId}/content/sites/${siteId}/files/v/${contentVersion}/section/page`,
    );
  });

  it('maps a canonical versioned file URL back to a decoded content route', () => {
    setContentContext();

    const route = (
      component as unknown as {
        routeFromHref: (href: string) => {path: string} | undefined;
      }
    ).routeFromHref(
      `/api/units/${unitId}/content/sites/${siteId}/files/v/${contentVersion}/Course%20Worksheet.docx`,
    );

    expect(route?.path).toBe('/Course Worksheet.docx');
  });

  it('loads new content when an input content route changes', () => {
    component.unit = {id: 1, myRole: 'Tutor'} as Unit;
    component.contentRoute = '/tasks/1.3P';

    const loadContentRoute = vi
      .spyOn(
        component as unknown as {
          loadContentRoute: (unitId: number, fragment?: string) => Promise<void>;
        },
        'loadContentRoute',
      )
      .mockResolvedValue(undefined);

    component.ngOnInit();
    component.contentRoute = '/tasks/1.4P';
    component.ngOnChanges({
      contentRoute: new SimpleChange('/tasks/1.3P', '/tasks/1.4P', false),
    });

    expect(loadContentRoute).toHaveBeenCalledTimes(2);
    expect(loadContentRoute).toHaveBeenLastCalledWith(1);
    expect(component.contentRoute).toBe('/tasks/1.4P');
  });

  it('opens remote content links in a new tab', () => {
    const link = document.createElement('a');
    const preventDefault = vi.fn();
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    link.href = 'https://example.com/resources/week-1';

    (
      component as unknown as {
        handleIframeClick: (event: MouseEvent) => void;
      }
    ).handleIframeClick({
      target: link,
      preventDefault,
    } as unknown as MouseEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(
      'https://example.com/resources/week-1',
      '_blank',
      'noopener,noreferrer',
    );
  });

  function setContentContext(): void {
    const unit = {
      id: unitId,
      myRole: 'Tutor',
      mainContentSiteId: siteId,
      contentSiteVersions: {[siteId]: contentVersion},
    } as unknown as Unit;

    (
      component as unknown as {
        setHeaderContext: (unit: Unit) => void;
      }
    ).setHeaderContext(unit);
  }
});
