import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {
  ActivityType,
  ActivityTypeService,
  TutorialStream,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {UnitTutorialsListComponent} from '../unit-tutorials-list/unit-tutorials-list.component';

@Component({
  selector: 'unit-tutorials-manager',
  templateUrl: 'unit-tutorials-manager.component.html',
  styleUrls: ['unit-tutorials-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [UnitTutorialsListComponent, MatIcon, MatButton, MatMenuTrigger, MatMenu, MatMenuItem],
})
export class UnitTutorialsManagerComponent implements OnInit {
  @Input() unit: Unit;

  activityTypes: ActivityType[] = new Array<ActivityType>();
  constructor(
    private activityTypeService: ActivityTypeService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    // Get the activity types
    this.activityTypeService.query().subscribe((activityTypes) => {
      this.activityTypes.push(...activityTypes);
    });
  }

  onClickNewActivity(activity: ActivityType) {
    this.unit.nextStream(activity.abbreviation).subscribe({
      next: (value: TutorialStream) => {
        this.alertService.success(`Added tutorial stream ${value.abbreviation}`, 2000);
      },
      error: (message) => {
        this.alertService.error(`Error creating tutorial stream: ${message}`, 8000);
      },
    });
  }
}
