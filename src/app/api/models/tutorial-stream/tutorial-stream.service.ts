import { HttpClient } from '@angular/common/http';
import { EntityService } from '../entity.service';
import { TutorialStream } from './tutorial-stream';
import { Injectable } from '@angular/core';

@Injectable()
export class TutorialStreamService extends EntityService<TutorialStream> {
  protected readonly endpointFormat = '';
  entityName = 'Stream';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  protected createInstanceFrom(json: any, other?: any): TutorialStream {
    const stream = new TutorialStream(json);
    stream.updateFromJson(json);
    return stream;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
