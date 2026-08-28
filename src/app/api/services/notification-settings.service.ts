import {EntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  NotificationSettings,
  NotificationUnitSettings,
} from 'src/app/api/models/notification-settings';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class NotificationSettingsService extends EntityService<NotificationSettings> {
  protected readonly endpointFormat = 'notification_settings';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'channels',
      'digestFrequency',
      'digestIntervalHours',
      'digestStartTime',
      'digestTime',
      'digestTimezone',
      'digestWeekday',
      'weeklySummary',
      {
        keys: 'units',
        toEntityFn: (data) =>
          ((data['units'] ?? []) as Record<string, unknown>[]).map((unit) => ({
            unitId: unit['unit_id'] as number,
            muted: unit['muted'] as boolean,
            channels: (unit['channels'] ?? undefined) as NotificationUnitSettings['channels'],
          })),
        toJsonFn: (settings) =>
          settings.units.map((unit) => ({
            unit_id: unit.unitId,
            muted: unit.muted,
            channels: unit.channels,
          })),
      },
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(_json: object): NotificationSettings {
    return new NotificationSettings();
  }

  public load(): Observable<NotificationSettings> {
    return this.get({});
  }

  public save(settings: NotificationSettings): Observable<NotificationSettings> {
    return this.update(settings, {ignoreKeys: ['digestTimezone']});
  }
}
