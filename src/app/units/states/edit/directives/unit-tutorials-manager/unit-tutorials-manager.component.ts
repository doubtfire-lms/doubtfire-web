import { Component, Input, SimpleChanges } from '@angular/core';
import { ActivityTypeService } from 'src/app/api/models/activity-type/activity-type.service';
import { ActivityType } from 'src/app/api/models/activity-type/activity-type';
import { TutorialStream } from 'src/app/api/models/tutorial-stream/tutorial-stream';

@Component({
  selector: 'unit-tutorials-manager',
  templateUrl: 'unit-tutorials-manager.component.html',
  styleUrls: ['unit-tutorials-manager.component.scss']
})
export class UnitTutorialsManagerComponent {
  @Input() unit: any;

  activityTypes: ActivityType[] = new Array<ActivityType>();
  tutorialsByStream: any[] = new Array<any>();

  constructor(
    private activityTypeService: ActivityTypeService
  ) {
  }

  ngOnInit() {
    // Get the activity types
    this.activityTypeService.query().subscribe((activityTypes) => {
      this.activityTypes.push(...activityTypes);
    });
  }

  onClickNewActivity(activity: ActivityType) {
    this.unit.nextStream(activity.abbreviation);
  }
}
