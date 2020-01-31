import { Component, Input } from '@angular/core';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';
import { ActivityTypeService } from 'src/app/api/models/activity-type/activity-type.service';
import { ActivityType } from 'src/app/api/models/activity-type/activity-type';

interface TutorialsSteamData {
  stream: string;
  tutorials: Tutorial[];
}

@Component({
  selector: 'unit-tutorials-manager',
  templateUrl: 'unit-tutorials-manager.component.html'
})
export class UnitTutorialsManagerComponent {
  @Input() unit: any;

  activityTypes: ActivityType[] = new Array<ActivityType>();
  tutorialsByStream: any[] = new Array<any>();

  constructor(
    private activityTypeService: ActivityTypeService,
  ) {
  }

  ngOnInit() {
    this.activityTypeService.query().subscribe((activityTypes) => {
      this.activityTypes.push(...activityTypes);
    });
    const tutorialsWithNostream: TutorialsSteamData = {
      stream: null,
      tutorials: this.unit.tutorials.filter(tutorial => !tutorial.tutorial_stream)
    };
    this.tutorialsByStream.push(tutorialsWithNostream);
    const tutorialsWithAStream: TutorialsSteamData[] = new Array<TutorialsSteamData>();
    this.unit.tutorial_streams.forEach(stream => {
      const tutorialsAndStream: TutorialsSteamData = {
        stream: stream,
        tutorials: this.unit.tutorials.filter(tutorial => tutorial.tutorial_stream === stream.abbreviation)
      };
      tutorialsWithAStream.push(tutorialsAndStream);
    });
    this.tutorialsByStream.push(...tutorialsWithAStream);
  }

  onClickNewActivity(activity: ActivityType) {
    console.log(activity);
  }
}
