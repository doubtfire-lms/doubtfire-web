import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Subject, of} from 'rxjs';
import {TaskTurnaroundComponent} from './task-turnaround.component';

describe('TaskTurnaroundComponent', () => {
  let fixture: ComponentFixture<TaskTurnaroundComponent>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [TaskTurnaroundComponent]}).compileComponents();
    fixture = TestBed.createComponent(TaskTurnaroundComponent);
    page = fixture.nativeElement;
  });

  function task(id: number, wait: number | null, marking: number | null) {
    return {
      task_definition_id: id,
      abbreviation: `P${id}`,
      feedback_wait: {average_seconds: wait},
      estimated_marking_time: {average_seconds: marking},
    };
  }

  function show(tasks: ReturnType<typeof task>[], grades: number[] = []) {
    fixture.componentRef.setInput('unit', {
      taskDef: (id: number) => ({targetGrade: grades[id]}),
      getTaskTurnaround: () => of({task_definitions: tasks}),
    });
    fixture.detectChanges();
  }

  it('orders task codes by grade, then naturally within each grade', () => {
    const codes = ['HD1', 'Case study', 'P10', 'D2', 'P2', 'Other'];
    show(
      codes.map((abbreviation, id) => ({...task(id, 60, null), abbreviation})),
      [3, 1, 0, 2, 0],
    );
    const labels = Array.from(page.querySelectorAll('tbody th'), (cell) => cell.textContent.trim());
    expect(labels).toEqual(['P2', 'P10', 'Case study', 'D2', 'HD1', 'Other']);
  });

  it('keeps zero and partially measured tasks and hides unmeasured tasks', () => {
    show([task(1, null, null), task(2, 0, null), task(3, null, 3600), task(4, 93780, null)]);
    const rows = Array.from(page.querySelectorAll('tbody tr'), (row) =>
      Array.from(row.querySelectorAll('th, td'), (cell) => cell.textContent.trim()),
    );
    expect(rows).toEqual([
      ['P2', '0d 0h 0m', '—'],
      ['P3', '—', '60 min'],
      ['P4', '1d 2h 3m', '—'],
    ]);
  });

  it('keeps tasks beyond the fifth in the keyboard-accessible scroll region', () => {
    show(Array.from({length: 8}, (_, i) => task(i + 1, 60, 30)));
    const region = page.querySelector<HTMLElement>('[role="region"]');
    expect(region.tabIndex).toBe(0);
    expect(region.classList.contains('overflow-auto')).toBe(true);
    expect(region.querySelectorAll('tbody tr')).toHaveLength(8);
  });

  it('shows an empty state when all averages are missing', () => {
    show([task(1, null, null)]);
    expect(page.textContent).toContain('No task turnaround data yet.');
    expect(page.querySelector('table')).toBeNull();
  });

  it('shows loading and request failure separately', () => {
    const request = new Subject();
    fixture.componentRef.setInput('unit', {getTaskTurnaround: () => request});
    fixture.detectChanges();
    expect(page.querySelector('[role="status"]')).not.toBeNull();
    request.error(new Error('unavailable'));
    fixture.detectChanges();
    expect(page.querySelector('[role="alert"]')).not.toBeNull();
  });
});
