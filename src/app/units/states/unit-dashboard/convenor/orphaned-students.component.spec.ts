import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OrphanedStudentsComponent} from './orphaned-students.component';

describe('OrphanedStudentsComponent', () => {
  let fixture: ComponentFixture<OrphanedStudentsComponent>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrphanedStudentsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(OrphanedStudentsComponent);
    page = fixture.nativeElement;
  });

  function render(students: unknown): void {
    fixture.componentRef.setInput('students', students);
    fixture.detectChanges();
  }

  it('lists enrolled students who have no tutor across all their tutorials', () => {
    const student = {name: 'Alex', username: 'alex'};
    render([
      {id: 1, student, enrolled: true, tutorials: []},
      {id: 2, student: {name: 'Sam', username: 'sam'}, enrolled: true, tutorials: [{tutor: null}]},
      {id: 3, student, enrolled: true, tutorials: [{tutor: null}, {tutor: {id: 7}}]},
      {id: 4, student, enrolled: false, tutorials: []},
    ]);

    expect(Array.from(page.querySelectorAll('li'), (row) => row.textContent.trim())).toEqual([
      'Alex (alex)',
      'Sam (sam)',
    ]);
  });

  it.each([
    {state: 'loading', students: null},
    {state: 'unavailable', students: 'Unavailable'},
    {state: 'empty', students: []},
    {state: 'fully allocated', students: [{id: 1, enrolled: true, tutorials: [{tutor: {id: 7}}]}]},
  ])('hides the section when the roster is $state', ({students}) => {
    render(students);
    expect(page.querySelector('section')).toBeNull();
  });
});
