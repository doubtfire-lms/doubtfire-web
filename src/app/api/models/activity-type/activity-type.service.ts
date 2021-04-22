import { CachedEntityService } from '../cached-entity.service';
import { ActivityType } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';

@Injectable()
export class ActivityTypeService extends CachedEntityService<ActivityType> {
  protected readonly endpointFormat = 'activity_types/:id:';
  entityName = 'ActivityType';

  protected createInstanceFrom(json: any, other?: any): ActivityType {
    const activityType = new ActivityType();
    activityType.updateFromJson(json);
    return activityType;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
