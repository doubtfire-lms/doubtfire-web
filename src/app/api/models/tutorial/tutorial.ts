import { Entity, EntityMapping } from 'ngx-entity-service';
import { AppInjector } from '../../../app-injector';
import { User, Campus, UserService, CampusService, TutorialStream } from 'src/app/api/models/doubtfire-model';
import { Unit } from '../unit';

export class Tutorial extends Entity {
  unit: Unit; // TODO: Convert to a unit object once this exists
  id: number;
  meetingDay: string;
  meetingTime: string;
  meetingLocation: string;
  abbreviation: string;
  campus: Campus;
  capacity: number;
  numStudents: number;
  tutor: User;
  tutorialStream: TutorialStream;

  constructor(unit: Unit) {
    super();
    this.unit = unit;
  }

  public static NoTutorial: Tutorial = new Tutorial(null);

  // /**
  //  * Map the passed in data to a json object on create for a tutorial.
  //  *
  //  * @param data The data to map to json to create a tutorial
  //  */
  // public static mapToCreateJson(unit: object, data: object) {
  //   const result = { tutorial: {} };
  //   for (const key of UPDATE_KEYS) {
  //     if (key === 'tutor_id') {
  //       result['tutorial']['tutor_id'] = data['tutorial']['tutor']['user_id'];
  //     } else if (key === 'campus_id') {
  //       if (data['tutorial']['campus']) result['tutorial']['campus_id'] = data['tutorial']['campus']['id'];
  //       else result['tutorial']['campus_id'] = -1;
  //     } else {
  //       result['tutorial'][key] = data['tutorial'][key];
  //     }
  //   }
  //   result['tutorial']['unit_id'] = unit['id'];

  //   return result;
  // }

  public toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      tutorial: super.toJson(mappingData, ignoreKeys),
    };
  }

  public get description(): string {
    let campusPart: string;
    if (this.campus) {
      campusPart = ` at ${this.campus.name}`;
    } else {
      campusPart = '';
    }

    return `${this.meetingDay.slice(0, 3)} at ${this.meetingTime} by ${this.tutorName} in ${
      this.meetingLocation
    }${campusPart}`;
  }

  public get tutorName(): string {
    if (this.tutor) return this.tutor.name;
    else return '';
  }

  public hasCapacity(): boolean {
    return this.capacity === -1 || this.capacity > this.numStudents;
  }
}
