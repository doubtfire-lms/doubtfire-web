import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatOptgroup, MatOption} from '@angular/material/autocomplete';
import {MatFormField} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {Project, Tutorial, TutorialStream, Unit} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'student-tutorial-select',
  templateUrl: 'student-tutorial-select.component.html',
  styleUrls: ['student-tutorial-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatFormField, MatSelect, MatOptgroup, MatOption],
})
export class StudentTutorialSelectComponent {
  @Input() unit: Unit;
  @Input() student: Project;

  /**
   * Compare a tutorial with an enrolment
   *
   * @param aEntity The tutorial itself
   * @param bEntity The tutorial enrolment
   */
  compareSelection(aEntity: Tutorial, bEntity: Tutorial) {
    if (!aEntity || !bEntity) {
      return;
    }
    return aEntity.id === bEntity.id;
  }

  public tutorialsForStreamAndStudent(student: Project, stream?: TutorialStream) {
    return this.unit.tutorials.filter((tutorial) => {
      const result: boolean =
        student.campus == null ||
        tutorial.campus == null ||
        student.campus.id === tutorial.campus.id;
      if (!result) {
        return result;
      }
      if (tutorial.tutorialStream && stream) {
        return tutorial.tutorialStream.abbreviation === stream.abbreviation;
      } else if (!tutorial.tutorialStream && !stream) {
        return true;
      } else {
        return false;
      }
    });
  }
}
