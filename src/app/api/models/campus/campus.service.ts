import { Campus } from './campus';
import { CacheableEntityService } from '../cacheableentity.service';
import { EntityService } from '../entity.service';

export class CampusService extends EntityService<Campus> {

  protected readonly endpointFormat = 'campuses/:id:';

  protected createInstanceFrom(json: any): Campus {
    let campus = new Campus();
    campus.updateFromJson(json);
    return campus;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
