import {Entity} from 'ngx-entity-service';
import {NotificationFrequency} from './notification';

/** The channels a notification kind is delivered on, keyed by kind. */
export type NotificationChannelMap = Record<string, string[]>;

export interface NotificationUnitSettings {
  unitId: number;
  muted: boolean;
  /** Absent while the unit still follows the user's defaults. */
  channels?: NotificationChannelMap;
}

export class NotificationSettings extends Entity {
  id: number;

  channels: NotificationChannelMap;
  digestFrequency: NotificationFrequency;
  digestTime: string;
  digestWeekday: number;
  weeklySummary: boolean;

  /** Only the units that depart from the defaults above. */
  units: NotificationUnitSettings[] = [];
}
