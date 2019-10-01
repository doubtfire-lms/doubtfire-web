import { Injectable, Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { User, Tutor } from 'src/app/api/models/user/user';
import { FormControl, FormGroup } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';
import { TutorialService } from 'src/app/api/models/tutorial/tutorial.service';
import { alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'unit-tutorial-edit-dialog',
  templateUrl: 'unit-tutorial-edit-dialog.component.html',
  styleUrls: ['unit-tutorial-edit-dialog.component.scss']
})
export class UnitTutorialEditDialogContent {

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  campuses: string[] = ['Burwood', 'Geelong', 'Cloud'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) private alerts: any,
    private tutorialService: TutorialService,
  ) {}

  saveTutorial() {
    this.data.tutorial.tutor_id = this.data.tutorControl.value.user_id
      ? this.data.tutorControl.value.user_id
      : this.data.tutorControl.value.id;

    if (this.data.isNew) {
      this.data.tutorial.unit_id = this.data.unit.id;
      this.tutorialService.create(this.data.tutorial).subscribe(
        result => {
          this.data.unit.tutorials.push(result);
          this.alerts.add('success', `Tutorial added`, 2000);
        },
        error => this.alerts.add('danger', `Error creating user. ${(error != null ? error : undefined)}`, 2000));
    } else {
      this.tutorialService.update(this.data.tutorial).subscribe(
        result => {
          this.alerts.add('success', `Updated tutorial`, 2000);
        },
        error => this.alerts.add('danger', `Error creating user. ${(error != null ? error : undefined)}`, 2000));
    }
  }

  displayTutorName(tutor?: Tutor): string | undefined {
    return tutor ? tutor.name : undefined;
  }
}

@Injectable()
export class UnitTutorialEditDialog {

  tutorControl = new FormControl();

  isNew = false;

  tutorial: Tutorial;

  tutors: User[];

  unit: any;

  filteredTutors: Observable<Tutor[]>;

  constructor(public dialog: MatDialog) {
    this.filteredTutors = this.tutorControl.valueChanges
    .pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name) : this.tutors.slice())
    );
  }
  show(unit: any, tutorial: any) {
    // Are we editing a tutorial? If not, then we have a new tutorial
    if (tutorial) {
      this.tutorial = tutorial;
      this.tutorControl.setValue(tutorial.tutor);
      this.tutorial.meeting_time = new Date(tutorial.meeting_time).toTimeString().split(' ')[0];
    } else {
      this.tutorial = new Tutorial();
      this.isNew = true;
      this.tutorial.meeting_day = 'Monday';
      this.tutorial.meeting_time = '08:30';
    }
    if (unit) {
      this.unit = unit;
      this.tutors = unit.staff;
    }

    this.dialog.open(UnitTutorialEditDialogContent, {
      data: {
        isNew: this.isNew,
        tutorial: this.tutorial,
        filteredTutors: this.filteredTutors,
        tutorControl: this.tutorControl,
        unit: this.unit
      },
      width: '500px'
    });
  }

  private _filter(value: string): Tutor[] {
    const filterName = value.toLowerCase();
    return this.tutors.filter(tutor => tutor.name.toLowerCase().indexOf(filterName) === 0);
  }
}

