import { AlertService } from 'src/app/common/services/alert.service';
import { Component, Input, OnInit } from '@angular/core';
import { Campus, CampusService, Project, Unit } from 'src/app/api/models/doubtfire-model';
import { MatSelectChange } from '@angular/material/select';
@Component({
  selector: 'student-campus-select',
  templateUrl: 'student-campus-select.component.html',
  styleUrls: ['student-campus-select.component.scss'],
})
export class StudentCampusSelectComponent implements OnInit {
  @Input() unit: Unit;
  @Input() student: Project;
  @Input() update: boolean;

  campuses: Campus[];
  private originalCampus: Campus;

  constructor(private campusService: CampusService, private alertService: AlertService) {}

  ngOnChanges() {
    this.originalCampus = this.student.campus;
  }

  ngOnInit() {
    this.campusService.query().subscribe((campuses) => {
      this.campuses = campuses;
    });
  }

  campusChange(event: MatSelectChange) {
    if (this.update) {
      this.student.switchToCampus(event.value).subscribe({
        next: (project: Project) => {
          this.alertService.success(`Campus changed for ${project.student.name}`);
          this.originalCampus = project.campus;
        },
        error: (message) => {
          this.student.campus = this.originalCampus;
          this.alertService.danger(message);
        },
      });
    }
  }
}
