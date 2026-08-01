import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Subject, of} from 'rxjs';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import {UnitStudentsEditorComponent} from './unit-students-editor.component';

describe('UnitStudentsEditorComponent', () => {
  const projectService = {
    loadStudents: vi.fn(() => of([] as Project[])),
  };
  let component: UnitStudentsEditorComponent;

  beforeEach(() => {
    vi.useFakeTimers();
    projectService.loadStudents.mockClear();
    component = new UnitStudentsEditorComponent(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      projectService as never,
      {} as never,
      {} as never,
    );
  });

  afterEach(() => {
    component.ngOnDestroy();
    vi.useRealTimers();
  });

  it('loads both enrolled and withdrawn projects', async () => {
    const unit = new Unit();
    const enrolledProjects: Subject<Project[]> = new Subject();
    unit.id = 12;
    component.unit = unit;
    projectService.loadStudents.mockImplementationOnce(() => enrolledProjects);

    component.ngOnInit();
    await vi.runAllTimersAsync();

    expect(projectService.loadStudents).toHaveBeenCalledTimes(1);
    expect(projectService.loadStudents).toHaveBeenNthCalledWith(1, unit, false, true);

    enrolledProjects.next([]);
    enrolledProjects.complete();

    expect(projectService.loadStudents).toHaveBeenCalledTimes(2);
    expect(projectService.loadStudents).toHaveBeenNthCalledWith(2, unit, true, true);
  });
});
