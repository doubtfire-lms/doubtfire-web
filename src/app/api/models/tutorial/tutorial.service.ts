import { Inject, Injectable } from '@angular/core';
import { currentUser, auth, analyticsService } from 'src/app/ajs-upgraded-providers';
import { HttpClient } from '@angular/common/http';
import { Tutorial } from './tutorial';
import { EntityService } from '../entity.service';

@Injectable()
export class TutorialService extends EntityService<Tutorial> {
  protected readonly endpointFormat = 'tutorials/:id:';
  entityName = 'Tutorial';

  constructor(httpClient: HttpClient,
    @Inject(currentUser) private currentUser: any,
    @Inject(auth) private auth: any,
    @Inject(analyticsService) private analyticsService: any,
  ) {
    super(httpClient);
  }

  protected createInstanceFrom(json: any, other?: any): Tutorial {
    let tutorial = new Tutorial(json, other);
    tutorial.updateFromJson(json);
    return tutorial;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
