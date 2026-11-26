import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TutorialStream} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class TutorialStreamService extends CachedEntityService<TutorialStream> {
  protected readonly endpointFormat = 'units/:unit_id:/tutorial_streams/:abbreviation:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys('id', 'name', 'abbreviation', 'activityType');

    this.mapping.mapAllKeysToJson();
  }

  public createInstanceFrom(_json: object): TutorialStream {
    return new TutorialStream();
  }

  public override keyForJson(json: {abbreviation: string}): string {
    return json['abbreviation'];
  }

  public override get keyName(): string {
    return 'abbreviation';
  }
}
