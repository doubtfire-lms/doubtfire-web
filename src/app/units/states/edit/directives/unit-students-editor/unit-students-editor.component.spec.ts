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

  it('stops showing the skeleton once enrolled projects arrive', async () => {
    const unit = new Unit();
    const enrolledProjects: Subject<Project[]> = new Subject();
    const withdrawnProjects: Subject<Project[]> = new Subject();
    unit.id = 12;
    component.unit = unit;
    projectService.loadStudents
      .mockImplementationOnce(() => enrolledProjects)
      .mockImplementationOnce(() => withdrawnProjects);

    component.ngOnInit();
    await vi.runAllTimersAsync();

    expect(component.loadingStudents).toBe(true);

    enrolledProjects.next([]);
    enrolledProjects.complete();

    // The withdrawn request is still in flight, but the table already has data to show.
    expect(component.loadingStudents).toBe(false);
  });

  it('does not show the skeleton when the unit already has cached students', async () => {
    const unit = new Unit();
    const project = new Project(unit);
    unit.id = 12;
    project.id = 34;
    unit.studentCache.add(project);
    component.unit = unit;

    component.ngOnInit();

    expect(component.loadingStudents).toBe(false);
  });

  it('only feeds the table once the paginator is bound', async () => {
    const unit = new Unit();
    const project = new Project(unit);
    unit.id = 12;
    project.id = 34;
    unit.studentCache.add(project);
    component.unit = unit;

    component.ngOnInit();

    // Without a paginator the table would render a row per student, so nothing may reach the
    // data source until ngAfterViewInit has bound one.
    expect(component.dataSource.data).toEqual([]);

    component.ngAfterViewInit();

    expect(component.dataSource.data).toEqual([project]);
  });
});
