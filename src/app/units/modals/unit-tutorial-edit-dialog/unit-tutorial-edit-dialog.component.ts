import { Injectable, Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { User, Tutor } from 'src/app/api/models/user/user';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

interface UnitTutorialEditDialogData {
  isNew: boolean;
  tutorial: any;
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
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  saveTutorial() {
    console.log('Tutorial saved.');
  }
}

@Injectable()
export class UnitTutorialEditDialog {
  formControl = new FormControl();
  filteredTutors: Observable<Tutor[]>;
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  unitTutorialEditDialogData: UnitTutorialEditDialogData;

  constructor(public dialog: MatDialog) {
    this.filteredTutors = this.formControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    this.unitTutorialEditDialogData = {
      isNew: false,
      tutorial: {},
      unit: {},
      tutors: []
    };
  }
  show(unit: any, tutorial: any) {
    // Are we editing a tutorial? If not, then we have a new tutorial
    if (tutorial) {
      this.unitTutorialEditDialogData.tutorial = tutorial;
    } else {
      this.unitTutorialEditDialogData.isNew = true;
      let date = new Date();
      date.setHours(8);
      date.setMinutes(30);
      this.unitTutorialEditDialogData.tutorial = {
        meeting_day: 'Monday',
        meeting_time: date,
        abbreviation: '',
        meeting_location: ''
      };
    }
    if (unit) {
      this.unitTutorialEditDialogData.unit = unit;
      this.unitTutorialEditDialogData.tutors = unit.staff;
    }

    this.dialog.open(UnitTutorialEditDialogContent, {
      data: {
        model: this.unitTutorialEditDialogData,
        days: this.days,
        filteredTutors: this.filteredTutors,
        formControl: this.formControl
      }
    });
  }

  private _filter(tutorName: string): Tutor[] {
    const filterName = tutorName.toLowerCase();
    return this.unitTutorialEditDialogData.tutors.filter(tutor => tutor.name.toLowerCase().indexOf(filterName) === 0);
  }
}

// d = new Date()
//   d.setHours(8)
//   d.setMinutes(30)

//   # Prototype tutorial
//   prototypeTutorial =
//     meeting_day: "Monday"
//     meeting_time: d
//     abbreviation: null
//     meeting_location: null

//   $scope.tutorial = tutorial or prototypeTutorial
//   $scope.isNew = !tutorial?
//   $scope.unit = unit

//   $scope.tutors = $scope.unit.staff

//   $scope.validForm = () ->
//     $scope.tutorial.tutor? && $scope.tutorial.abbreviation? && $scope.tutorial.meeting_location?

//   $scope.saveTutorial = ->
//     save_data = _.omit($scope.tutorial, 'tutor', 'tutor_name', 'meeting_time', 'data')
//     save_data.tutor_id = if $scope.tutorial.tutor.user_id then $scope.tutorial.tutor.user_id else $scope.tutorial.tutor.id

//     if $scope.tutorial.meeting_time.getHours
//       save_data.meeting_time = $scope.tutorial.meeting_time.getHours() + ":" + $scope.tutorial.meeting_time.getMinutes()

//     unless save_data.tutor_id?
//       alertService.add 'danger', 'Ensure that you select a tutor from those engaged in this unit.', 6000
//       return

//     if $scope.isNew
//       save_data.unit_id = unit.id
//       Tutorial.create({ tutorial: save_data }).$promise.then (
//         (response) ->
//           $modalInstance.close(response)
//           $scope.unit.tutorials.push(response)
//           alertService.add("success", "Tutorial Added", 2000)
//       ),
//       (
//         (response) ->
//           if response.data.error?
//             alertService.add("danger", "Error: " + response.data.error, 6000)
//       )
//     else
//       Tutorial.update( { id: tutorial.id, tutorial: save_data } ).$promise.then (
//         (response) ->
//           $modalInstance.close(response)
//           $scope.tutorial.tutor = response.tutor
//           $scope.tutorial.tutor_name = response.tutor_name
//           alertService.add("success", "Tutorial Updated", 2000)
//       ),
//       (
//         (response) ->
//           if response.data.error?
//             alertService.add("danger", "Error: " + response.data.error, 6000)
//       )
// )

