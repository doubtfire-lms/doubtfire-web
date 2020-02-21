import { Unit } from './../../../../../../ajs-upgraded-providers';
import { Component, Input } from '@angular/core';
import { TutorialStream } from 'src/app/api/models/tutorial-stream/tutorial-stream';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';

@Component({
  selector: 'student-tutorial-select',
  templateUrl: 'student-tutorial-select.component.html',
  styleUrls: ['student-tutorial-select.component.scss']
})
export class StudentTutorialSelectComponent {
  @Input() unit: any;
  @Input() student: any;


  /**
   * Compare a tutorial with an enrolment
   *
   * @param aEntity The tutorial itself
   * @param bEntity The tutorial enrolment
   */
  compareSelection(aEntity:  Tutorial, bEntity: any) {
    if (!aEntity || !bEntity) {
      return;
    }
    return aEntity.id === bEntity.tutorial_id;
  }

  public tutorialsForStreamAndStudent(student: any, stream: TutorialStream = undefined) {
    return this.unit.tutorials.filter(tutorial => {
      if (tutorial.tutorial_stream && stream) {
        return tutorial.tutorial_stream.abbreviation === stream.abbreviation
          && student.campus_id === tutorial.campus.id;
      } else if (!tutorial.tutorial_stream && !stream) {
        return student.campus_id === tutorial.campus.id;
      }
    });
  }
}
