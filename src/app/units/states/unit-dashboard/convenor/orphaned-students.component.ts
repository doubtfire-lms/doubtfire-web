import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {Project} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-orphaned-students',
  templateUrl: './orphaned-students.component.html',
  host: {class: 'block'},
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrphanedStudentsComponent {
  readonly students = input.required<Project[] | 'Unavailable' | null>();

  protected readonly orphanedStudents = computed(() => {
    const students = this.students();
    if (!Array.isArray(students)) {
      return [];
    }

    return students.filter(
      (project) => project.enrolled && !project.tutorials.some((tutorial) => tutorial.tutor?.id),
    );
  });
}
