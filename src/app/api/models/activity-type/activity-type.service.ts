import { CacheableEntityService } from '../cacheableentity.service';
import { ActivityType } from './activity-type';

export class ActivityTypeService extends CacheableEntityService<ActivityType> {

  protected readonly endpointFormat = 'activity_types/:id:';
  entityName = 'ActivityType';

  protected createInstanceFrom(json: any): ActivityType {
    let activityType = new ActivityType();
    activityType.updateFromJson(json);
    return activityType;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
