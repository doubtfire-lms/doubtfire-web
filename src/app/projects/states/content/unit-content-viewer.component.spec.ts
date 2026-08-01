import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SimpleChange} from '@angular/core';
import {Unit} from 'src/app/api/models/doubtfire-model';
import {UnitContentViewerComponent} from './unit-content-viewer.component';

describe('UnitContentViewerComponent', () => {
  let component: UnitContentViewerComponent;

  beforeEach(() => {
    component = new UnitContentViewerComponent(
      {} as never,
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
});
