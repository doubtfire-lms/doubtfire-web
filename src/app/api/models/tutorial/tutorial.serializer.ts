import { Tutorial } from './tutorial';


export class TutorialSerializer {
  fromJson(json: any): Tutorial {
    const tutorial = new Tutorial();
    tutorial.unit_id = json.unit_id;
    tutorial.tutor_id = json.tutor_id;
    tutorial.abbreviation = json.abbreviation;
    tutorial.meeting_location = json.meeting_location;
    tutorial.meeting_day = json.meeting_day;
    tutorial.meeting_time = json.meeting_time;
    return tutorial;
  }

  toJson(tutorial: Tutorial): any {
    return {
      tutorial: {
        unit_id: tutorial.unit_id,
        tutor_id: tutorial.tutor_id,
        abbreviation: tutorial.abbreviation,
        meeting_location: tutorial.meeting_location,
        meeting_day: tutorial.meeting_day,
        meeting_time: tutorial.meeting_time
      }
    };
  }
}
