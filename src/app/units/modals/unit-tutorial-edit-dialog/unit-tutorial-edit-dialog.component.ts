import { Injectable, Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { User, Tutor } from 'src/app/api/models/user/user';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';
import { TutorialService } from 'src/app/api/models/tutorial/tutorial.service';
import { alertService } from 'src/app/ajs-upgraded-providers';

interface UnitTutorialEditDialogData {
  isNew: boolean;
  tutorial: Tutorial;
  unit: any;
  tutors: User[];
}

@Component({
  selector: 'unit-tutorial-edit-dialog',
  templateUrl: 'unit-tutorial-edit-dialog.component.html',
  styleUrls: ['unit-tutorial-edit-dialog.component.scss']
})
export class UnitTutorialEditDialogContent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) private alerts: any,
    private tutorialService: TutorialService,
  ) { }

  get formValid() {
    return this.data.tutor && this.data.tutorial.abbreviation && this.data.tutorial.meeting_location;
  }

  saveTutorial() {
    this.data.model.tutorial.tutor_id = this.data.formControl.value.user_id
      ? this.data.formControl.value.user_id
      : this.data.formControl.value.id;

    if (this.data.model.isNew) {
      this.data.model.tutorial.unit_id = this.data.model.unit.id;
      this.tutorialService.create(this.data.model.tutorial).subscribe(
        result => {
          this.alerts.add('success', `Tutorial added`, 2000);
        },
        error => this.alerts.add('danger', `Error creating user. ${(error != null ? error : undefined)}`, 2000));
    } else {
      this.tutorialService.update(this.data.model.tutorial).subscribe(
        result => {
          this.alerts.add('success', `Updated tutorial`, 2000);
        },
        error => this.alerts.add('danger', `Error creating user. ${(error != null ? error : undefined)}`, 2000));
    }
  }
}

@Injectable()
export class UnitTutorialEditDialog {
  formControl = new FormControl();
  filteredTutors: Observable<Tutor[]>;
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  campus: string[] = ['Burwood', 'Geelong', 'Cloud'];
  unitTutorialEditDialogData: UnitTutorialEditDialogData;

  constructor(public dialog: MatDialog) {
    this.filteredTutors = this.formControl.valueChanges
    .pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name) : this.unitTutorialEditDialogData.tutors.slice())
    );
    this.unitTutorialEditDialogData = {
      isNew: false,
      tutorial: new Tutorial(),
      unit: {},
      tutors: []
    };
  }
  show(unit: any, tutorial: any) {
    // Are we editing a tutorial? If not, then we have a new tutorial
    if (tutorial) {
      this.formControl.setValue(tutorial.tutor);
      this.unitTutorialEditDialogData.tutorial = tutorial;
      this.unitTutorialEditDialogData.tutorial.meeting_time = new Date(tutorial.meeting_time).toTimeString().split(' ')[0];
    } else {
      this.unitTutorialEditDialogData.isNew = true;
      this.unitTutorialEditDialogData.tutorial.meeting_day = 'Monday';
      this.unitTutorialEditDialogData.tutorial.meeting_time = '08:30';
      this.unitTutorialEditDialogData.tutorial.abbreviation = '';
      this.unitTutorialEditDialogData.tutorial.meeting_location = '';
    }
    if (unit) {
      this.unitTutorialEditDialogData.unit = unit;
      this.unitTutorialEditDialogData.tutors = unit.staff;
    }

    this.dialog.open(UnitTutorialEditDialogContent, {
      data: {
        model: this.unitTutorialEditDialogData,
        days: this.days,
        campus: this.campus,
        filteredTutors: this.filteredTutors,
        formControl: this.formControl,
        tutorName: this.displayFn
      },
      width: '500px'
    });
  }

  private _filter(value: string): Tutor[] {
    const filterName = value.toLowerCase();
    return this.unitTutorialEditDialogData.tutors.filter(tutor => tutor.name.toLowerCase().indexOf(filterName) === 0);
  }

  displayFn(tutor?: Tutor): string | undefined {
    return tutor ? tutor.name : undefined;
  }
}

