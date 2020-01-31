import { HttpClient } from '@angular/common/http';
import { EntityService } from '../entity.service';
import { Stream } from './stream';

export class StreamService extends EntityService<Stream> {
  protected readonly endpointFormat = '';
  entityName = 'Stream';

  constructor(httpClient: HttpClient
  ) {
    super(httpClient);
  }

  protected createInstanceFrom(json: any): Stream {
    let stream = new Stream(json);
    stream.updateFromJson(json);
    return stream;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
