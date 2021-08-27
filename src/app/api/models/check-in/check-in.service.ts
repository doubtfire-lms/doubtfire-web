import { Inject, Injectable } from '@angular/core';
import { currentUser, auth, analyticsService } from 'src/app/ajs-upgraded-providers';
import { HttpClient } from '@angular/common/http';
import { CheckIn, Project } from 'src/app/api/models/doubtfire-model';
import { EntityService, HttpOptions } from '../entity.service';

@Injectable()
export class CheckInService extends EntityService<CheckIn> {
  protected readonly endpointFormat = 'iotrack/check-ins';
  entityName = 'CheckIn';

  constructor(
    httpClient: HttpClient,
    @Inject(currentUser) private CurrentUser: any,
    @Inject(auth) private Auth: any,
    @Inject(analyticsService) private AnalyticsService: any
  ) {
    super(httpClient);
  }

  protected createInstanceFrom(json: any, other?: any): CheckIn {
    const checkIn = new CheckIn(json, other);
    checkIn.updateFromJson(json);
    return checkIn;
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  public assignUserToIdCard(checkin: CheckIn, user: Project) {
    const opts: HttpOptions = {
      alternateEndpointFormat: 'iotrack/assign-user-to-id-card',
    };

    return super.put(
      {},
      {
        id: checkin.id,
        id_card_id: checkin.card,
        username: user.student_id,
      },
      opts
    );
  }

  public checkout(checkin: CheckIn) {
    const opts: HttpOptions = {
      alternateEndpointFormat: 'iotrack/checkout/:id:',
    };

    return super.update(
      {
        id: checkin.id,
      },
      checkin,
      opts
    );
  }

  public checkoutEveryone(tutorial_id: number, room_number: string, time_limit = 0) {
    const opts: HttpOptions = {
      alternateEndpointFormat: '/iotrack/checkout-everyone-not-in-tutorial',
    };

    return super.put(
      {},
      {
        room_number,
        tutorial_id,
        time_limit,
      },
      opts
    );
  }
}
