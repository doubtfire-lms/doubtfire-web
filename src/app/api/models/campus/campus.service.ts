import { Campus } from './campus';
import { CacheableEntityService } from '../cacheableentity.service';

export class CampusService extends CacheableEntityService<Campus> {

  protected readonly endpointFormat = 'campuses/:id:';
  entityName = 'Campus';

  protected createInstanceFrom(json: any): Campus {
    let campus = new Campus();
    campus.updateFromJson(json);
    return campus;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
