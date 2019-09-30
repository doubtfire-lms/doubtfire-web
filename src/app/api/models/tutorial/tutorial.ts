import { Resource } from '../resource';

export class Tutorial extends Resource {
  unit_id: number;
  tutor_id: number;
  abbreviation: string;
  meeting_location: string;
  meeting_day: string;
  meeting_time: string;
}
