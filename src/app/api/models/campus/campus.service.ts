import { Campus } from 'src/app/api/models/doubtfire-model';
import { CachedEntityService } from '../cached-entity.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CampusService extends CachedEntityService<Campus> {
  protected readonly endpointFormat = 'campuses/:id:';
  entityName = 'Campus';

  protected createInstanceFrom(json: any, other?: any): Campus {
    const campus = new Campus();
    campus.updateFromJson(json);
    return campus;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
