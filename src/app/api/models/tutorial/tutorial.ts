import { Entity } from '../entity';
import { User } from '../user/user';
import { UserService } from '../user/user.service';
import { AppInjector } from '../../../app-injector';
import { Campus } from '../campus/campus';
import { CampusService } from '../campus/campus.service';

const READ_KEYS =
  [
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

const UPDATE_KEYS =
  [
    'id',
    'meeting_day',
    'meeting_time',
    'meeting_location',
    'abbreviation',
    'campus_id',
    'capacity',
    'tutor_id',
    'unit_id',
    'tutorial_stream_abbr'
  ];

const IGNORE = [
  'campus_id',
  'tutor_name',
  'tutor_id'
];

export class Tutorial extends Entity {

  id: number;
  meeting_day: string;
  meeting_time: string;
  meeting_location: string;
  abbreviation: string;
  campus: Campus;
  capacity: number;
  num_students: number;
  tutor: User;
  tutorial_stream: string;
  // unit: Unit;

  description: string;

  /**
   * Map the passed in data to a json object on create for a tutorial.
   *
   * @param data The data to map to json to create a tutorial
   */
  public static mapToCreateJson(unit: Object, data: Object) {
    let result = { tutorial: {} };
    for (const key of UPDATE_KEYS) {
      if (key === 'tutor_id') {
        result['tutorial']['tutor_id'] = data['tutorial']['tutor']['user_id'];
      } else if (key === 'campus_id') {
        result['tutorial']['campus_id'] = data['tutorial']['campus']['id'];
      } else {
        result['tutorial'][key] = data['tutorial'][key];
      }
    }
    result['tutorial']['unit_id'] = unit['id'];

    return result;
  }

  toJson(): any {
    return {
      tutorial: super.toJsonWithKeys(UPDATE_KEYS, {
        tutor_id: (data: Object) => {
          return data['tutor']['user_id'] ? data['tutor']['user_id'] : data['tutor']['id'];
        },
        campus_id: (data: Object) => {
          return data['campus']['id'];
        }
      })
    };
  }

  setFromJson(data: any, keys: string[], ignoredKeys?: string[], maps?: Object): void {
    super.setFromJson(data, keys, ignoredKeys, maps);
    if (data.campus_id) {
      AppInjector.get(CampusService).get(data.campus_id).subscribe(campus => {
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
    this.description = ` ${this.meeting_day.slice(0, 3)} at ${this.meeting_time} by ${data.tutor_name} in ${this.meeting_location}`;
  }

  public updateFromJson(data: any): void {
    this.setFromJson(data, READ_KEYS, IGNORE, {
      meeting_time: (dateString: string) => {
        const time = new Date(dateString).toLocaleTimeString();
        return time.slice(0, time.lastIndexOf(':'));
      }
    });
  }

  public get key(): string {
    return this.id.toString();
  }
  public keyForJson(json: any): string {
    return json.id;
  }
}
