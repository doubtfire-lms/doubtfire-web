import { Entity } from '../entity';
import { User } from '../user/user';
import { UserService } from '../user/user.service';
import { AppInjector } from '../../../app-injector';
import { Campus } from '../campus/campus';
import { CampusService } from '../campus/campus.service';
import { TutorialStream } from '../tutorial-stream/tutorial-stream';

const READ_KEYS = [
  'id',
  'meeting_day',
  'meeting_time',
  'meeting_location',
  'abbreviation',
  'campus_id',
  'capacity',
  'tutor_name',
  'tutor_id',
  'num_students',
  'tutorial_stream',
  'tutor',
];

const UPDATE_KEYS = [
  'id',
  'meeting_day',
  'meeting_time',
  'meeting_location',
  'abbreviation',
  'campus_id',
  'capacity',
  'tutor_id',
  'unit_id',
  'tutorial_stream_abbr',
];

const IGNORE = ['campus_id', 'tutor_name', 'tutor_id'];

export class Tutorial extends Entity {
  unit: any; // TODO: Convert to a unit object once this exists
  id: number;
  meeting_day: string;
  meeting_time: string;
  meeting_location: string;
  abbreviation: string;
  campus: Campus;
  capacity: number;
  num_students: number;
  tutor: User;
  tutorial_stream: TutorialStream;

  /**
   * Map the passed in data to a json object on create for a tutorial.
   *
   * @param data The data to map to json to create a tutorial
   */
  public static mapToCreateJson(unit: object, data: object) {
    const result = { tutorial: {} };
    for (const key of UPDATE_KEYS) {
      if (key === 'tutor_id') {
        result['tutorial']['tutor_id'] = data['tutorial']['tutor']['user_id'];
      } else if (key === 'campus_id') {
        if (data['tutorial']['campus']) result['tutorial']['campus_id'] = data['tutorial']['campus']['id'];
        else result['tutorial']['campus_id'] = -1;
      } else {
        result['tutorial'][key] = data['tutorial'][key];
      }
    }
    result['tutorial']['unit_id'] = unit['id'];

    return result;
  }

  constructor(initialData: object, unit: any) {
    super(); // delay update from json
    this.unit = unit;
    if (initialData) {
      this.updateFromJson(initialData);
    }
  }

  toJson(): any {
    return {
      tutorial: super.toJsonWithKeys(UPDATE_KEYS, {
        tutor_id: (data: object) => {
          return data['tutor']['user_id'] ? data['tutor']['user_id'] : data['tutor']['id'];
        },
        campus_id: (data: object) => {
          if (data['campus']) return data['campus']['id'];
          else return -1;
        },
      }),
    };
  }

  setFromJson(data: any, keys: string[], ignoredKeys?: string[], maps?: object): void {
    super.setFromJson(data, keys, ignoredKeys, maps);
    if (data.campus_id) {
      AppInjector.get(CampusService)
        .get(data.campus_id)
        .subscribe((campus) => {
          this.campus = campus;
        });
    }
    if (data.tutor) {
      const userService = AppInjector.get(UserService);
      let t = userService.getFromCache(data.tutor.id);
      if (!t) {
        t = new User(data.tutor);
        userService.addEntityToCache(data.tutor.id, t);
      }
      this.tutor = t;
    }
    if (data.tutorial_stream) {
      const ts = this.unit.tutorialStreamForAbbr(data.tutorial_stream);
      this.tutorial_stream = ts;
      // this is where the stream should be instantiated
    }
  }

  public updateFromJson(data: any): void {
    this.setFromJson(data, READ_KEYS, IGNORE, {
      meeting_time: (dateString: string) => {
        const time = new Date(dateString).toLocaleTimeString();
        return time.slice(0, time.lastIndexOf(':'));
      },
    });
  }

  public get description(): string {
    let campusPart: string;
    if (this.campus) {
      campusPart = ` at ${this.campus.name}`;
    } else {
      campusPart = '';
    }

    return `${this.meeting_day.slice(0, 3)} at ${this.meeting_time} by ${this.tutorName} in ${
      this.meeting_location
    }${campusPart}`;
  }

  public get tutorName(): string {
    if (this.tutor) return this.tutor.name;
    else return '';
  }

  public get key(): string {
    return this.id.toString();
  }
  public keyForJson(json: any): string {
    return json.id;
  }
}
