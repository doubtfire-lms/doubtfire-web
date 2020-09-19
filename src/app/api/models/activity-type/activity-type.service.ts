import { CacheableEntityService } from '../cacheable-entity.service';
import { ActivityType } from './activity-type';
import { Injectable } from '@angular/core';

@Injectable()
export class ActivityTypeService extends CacheableEntityService<ActivityType> {
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
