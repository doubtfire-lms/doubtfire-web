import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { ActivityType, ActivityTypeService, TutorialStream, Unit } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'unit-tutorials-manager',
  templateUrl: 'unit-tutorials-manager.component.html',
  styleUrls: ['unit-tutorials-manager.component.scss'],
})
export class UnitTutorialsManagerComponent {
  @Input() unit: Unit;

  activityTypes: ActivityType[] = new Array<ActivityType>();
  tutorialsByStream: any[] = new Array<any>();

  constructor(
    private activityTypeService: ActivityTypeService,
    @Inject(alertService) private alertService: any
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
        this.alertService.add("success", `Added tutorial stream ${value.abbreviation}`, 2000);
      },
      error: (message) => {
        this.alertService.add("danger", `Error creating tutorial stream: ${message}`, 8000);
      }
    });
  }
}
