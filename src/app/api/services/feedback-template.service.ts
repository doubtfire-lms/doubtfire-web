import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import API_URL from 'src/app/config/constants/apiUrl';
import {FeedbackTemplate} from '../models/feedback-template';

@Injectable()
export class FeedbackTemplateService extends CachedEntityService<FeedbackTemplate> {
  protected readonly endpointFormat = ':contextType:/:contextId:/feedback_chips';
  public static addEndpoint = 'feedback_chips';
  public static updateEndpoint = 'feedback_chips/:id:';
  public static globalEndpoint = 'global/feedback_chips';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'type',
      'chipText',
      'description',
      'commentText',
      'summaryText',
      'taskStatus',
      'parentChipId',
      'learningOutcomeId',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public override createInstanceFrom(_json: object): FeedbackTemplate {
    return new FeedbackTemplate();
  }
}
