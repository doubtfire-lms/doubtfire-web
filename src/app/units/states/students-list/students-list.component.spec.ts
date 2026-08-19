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

    const component = buildComponent(unit);

    expect(component['filteredProjects']()).toEqual([enrolledProject]);
    expect(unit.studentFilterTypeAheadData).toContain(enrolledProject.student.name);
    expect(unit.studentFilterTypeAheadData).not.toContain(withdrawnProject.student.name);
  });

  it('searches over students with incomplete details', () => {
    const unit = new Unit();
    const noEmail = buildProject(unit, 1, true, 'Ann');
    noEmail.student.email = null;
    const noLastName = buildProject(unit, 2, true, 'Bob');
    noLastName.student.lastName = null;
    const noStudent = buildProject(unit, 3, true, 'Cat');
    noStudent.student = undefined;
    unit.studentCache.add(noEmail);
    unit.studentCache.add(noLastName);
    unit.studentCache.add(noStudent);

    const component = buildComponent(unit);
    component.searchText = 'bob';

    expect(component['filteredProjects']()).toEqual([noLastName]);
  });

  it('suggests students with incomplete details without failing', () => {
    const unit = new Unit();
    const noUsername = buildProject(unit, 1, true, 'Ann');
    noUsername.student.username = undefined;
    unit.studentCache.add(noUsername);

    const component = buildComponent(unit);
    component.searchText = 'ann';
    component['updateSuggestions']();

    expect(component.filteredSuggestions).toEqual([noUsername.student.name]);
  });
});

function buildComponent(unit: Unit): StudentsListComponent {
  const component = new StudentsListComponent(
    {} as never,
    {} as never,
    {} as never,
    {currentUser: new User()} as never,
    {} as never,
    {} as never,
  );
  component.unit = unit;
  return component;
}

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
