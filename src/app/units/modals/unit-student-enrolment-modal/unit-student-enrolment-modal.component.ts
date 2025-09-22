import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Campus, Project, Unit } from 'src/app/api/models/doubtfire-model';
import { CampusService } from 'src/app/api/services/campus.service';
import { AlertService } from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-unit-student-enrolment-modal',
  templateUrl: 'unit-student-enrolment-modal.component.html',
  styleUrls: ['unit-student-enrolment-modal.component.scss'],
})
export class UnitStudentEnrolmentModalComponent implements OnInit {
  unit: Unit;
  campuses: Campus[];
  studentIdOrEmail: string;
  selectedCampus: Campus;

  constructor(
    public dialogRef: MatDialogRef<UnitStudentEnrolmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {unit: Unit},
    public alertService: AlertService,
    public campusService: CampusService,
  ) {}

  ngOnInit() {
    this.unit = this.data.unit;
    this.campusService.query().subscribe((campuses: Campus[]) => {
      this.campuses = campuses;
    });
  }

  enrolStudent(studentIdOrEmail: string, campus: Campus) {
    if (!campus) {
      this.alertService.error('Campus missing. Please indicate student campus', 5000);
      return;
    }
    this.unit.enrolStudent(studentIdOrEmail, campus).
      subscribe({
        next: (_: Project) => {
          this.alertService.success('Student enrolled', 2000);
          this.dialogRef.close();
        },
        error: (response: string) => {
          this.alertService.error(`Error enrolling student: ${response}`, 6000);
        }
      }
    );
  }
}
