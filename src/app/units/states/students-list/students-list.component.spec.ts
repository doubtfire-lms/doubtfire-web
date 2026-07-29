import {describe, expect, it} from 'vitest';
import {Project, Unit, User} from 'src/app/api/models/doubtfire-model';
import {StudentsListComponent} from './students-list.component';

describe('StudentsListComponent', () => {
  it('only includes enrolled projects', () => {
    const unit = new Unit();
    const enrolledProject = buildProject(unit, 1, true, 'Enrolled');
    const withdrawnProject = buildProject(unit, 2, false, 'Withdrawn');
    unit.studentCache.add(enrolledProject);
    unit.studentCache.add(withdrawnProject);

    const component = new StudentsListComponent(
      {} as never,
      {} as never,
      {} as never,
      {currentUser: new User()} as never,
      {} as never,
      {} as never,
    );
    component.unit = unit;

    expect(component['filteredProjects']()).toEqual([enrolledProject]);
    expect(unit.studentFilterTypeAheadData).toContain(enrolledProject.student.name);
    expect(unit.studentFilterTypeAheadData).not.toContain(withdrawnProject.student.name);
  });
});

function buildProject(unit: Unit, id: number, enrolled: boolean, firstName: string): Project {
  const student = new User();
  student.firstName = firstName;
  student.lastName = 'Student';
  student.username = firstName.toLowerCase();

  const project = new Project(unit);
  project.id = id;
  project.enrolled = enrolled;
  project.student = student;
  return project;
}
