import {Entity, EntityMapping} from 'ngx-entity-service';
import {User} from './doubtfire-model';
import {Unit} from './unit';

export class MarkingSession extends Entity {
  id: number;

  // tutor
  user: User;

  unit: Unit;

  startTime: Date;
  endTime: Date;
  duringTutorial: boolean;
  durationMinutes: number;

  // Aggregated session activities count
  commentsAdded: number;
  assessments: number;
  submissionsOpened: number;

  constructor(data?: Unit) {
    super();
    if (data) {
      this.unit = data;
    } else {
      console.error('Failed to get unit');
    }
  }

  public override toJson<T extends Entity>(
    mappingData: EntityMapping<T>,
    ignoreKeys?: string[],
  ): object {
    return {
      markingSession: super.toJson(mappingData, ignoreKeys),
    };
  }
}
