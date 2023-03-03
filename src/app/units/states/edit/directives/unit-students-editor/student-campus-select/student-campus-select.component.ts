import { Component, Inject, Input, OnInit } from '@angular/core';
import { Campus, CampusService, Project, Unit } from 'src/app/api/models/doubtfire-model';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { alertService } from 'src/app/ajs-upgraded-providers';

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

  constructor(
    private campusService: CampusService,
    @Inject(alertService) private alertService: any
  ) { }

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
          this.alertService.add('success', `Campus changed for ${project.student.name}`, 2000);
          this.originalCampus = project.campus;
        },
        error: (message) => {
          this.student.campus = this.originalCampus;
          this.alertService.add('danger', message, 6000);
        }
      })
    }
  }
}
