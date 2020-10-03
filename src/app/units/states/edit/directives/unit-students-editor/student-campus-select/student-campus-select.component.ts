import { Component, Input, OnInit } from '@angular/core';
import { Campus } from 'src/app/api/models/campus/campus';
import { CampusService } from 'src/app/api/models/campus/campus.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'student-campus-select',
  templateUrl: 'student-campus-select.component.html',
  styleUrls: ['student-campus-select.component.scss'],
})
export class StudentCampusSelectComponent implements OnInit {
  @Input() unit: any;
  @Input() student: any;
  @Input() update: boolean;

  campuses: Campus[];
  private originalCampusId: number;

  constructor(private campusService: CampusService) {}

  ngOnChanges() {
    this.originalCampusId = this.student.campus_id;
  }

  ngOnInit() {
    this.campusService.query().subscribe((campuses) => {
      this.campuses = campuses;
    });
  }

  campusChange(event: MatSelectChange) {
    if (this.update) {
      this.student.switchToCampus(event.value, this.originalCampusId, () => this.ngOnChanges());
    }
  }
}
