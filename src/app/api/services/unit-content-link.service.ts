import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import type {Unit} from 'src/app/api/models/unit';
import {UnitContentLink} from 'src/app/api/models/unit-content-link';
import API_URL from 'src/app/config/constants/apiUrl';
import {UnitContentSiteService} from './unit-content-site.service';

@Injectable()
export class UnitContentLinkService extends CachedEntityService<UnitContentLink> {
  protected readonly endpointFormat = 'units/:unitId:/content/links/:id:';
  private readonly unitContentHttpClient: HttpClient;

  constructor(
    httpClient: HttpClient,
    private unitContentSiteService: UnitContentSiteService,
  ) {
    super(httpClient, API_URL);
    this.unitContentHttpClient = httpClient;

    this.mapping.addKeys(
      'id',
      'route',
      'unitId',
      'unitContentSiteId',
      'contextType',
      'contextKey',
      {
        keys: 'site',
        toEntityFn: (data, key) => {
          const site = data[key] as {id: number};
          if (!site) {
            return undefined;
          }

          return this.unitContentSiteService.cache.getOrCreate(
            site.id,
            this.unitContentSiteService,
            site,
          );
        },
      },
    );
  }

  public createInstanceFrom(_json: object, unit?: Unit): UnitContentLink {
    return new UnitContentLink(unit);
  }

  public loadForUnit(unit: Unit): Observable<UnitContentLink[]> {
    return this.query({unitId: unit.id}, this.requestOptions(unit));
  }

  public updateForUnit(unit: Unit, links: UnitContentLink[]): Observable<UnitContentLink[]> {
    return this.unitContentHttpClient
      .put<object[]>(`${API_URL}/units/${unit.id}/content/links`, {
        links: links.map((link) => ({
          context_type: link.contextType,
          context_key: link.contextKey,
          unit_content_site_id: link.unitContentSiteId,
          route: link.route,
        })),
      })
      .pipe(
        map((responseLinks) => {
          unit.unitContentLinkCache.clear();
          responseLinks.forEach((link) => {
            unit.unitContentLinkCache.getOrCreate(link['id'], this, link, {
              constructorParams: unit,
            });
          });

          return [...unit.contentLinks];
        }),
      );
  }

  private requestOptions(unit: Unit): RequestOptions<UnitContentLink> {
    return {
      endpointFormat: this.endpointFormat,
      cache: unit.unitContentLinkCache,
      sourceCache: unit.unitContentLinkCache,
      cacheBehaviourOnGet: 'cacheQuery',
      constructorParams: unit,
    };
  }
}
