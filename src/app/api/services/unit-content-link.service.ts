import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import type {Unit} from 'src/app/api/models/unit';
import {UnitContentLink, UnitContentSite} from 'src/app/api/models/unit-content-link';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class UnitContentLinkService extends CachedEntityService<UnitContentLink> {
  protected readonly endpointFormat = 'units/:unitId:/content/links/:id:';
  private readonly unitContentHttpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);
    this.unitContentHttpClient = httpClient;

    this.mapping.addKeys(
      'id',
      'route',
      {
        keys: ['unitId', 'unit_id'],
      },
      {
        keys: ['unitContentSiteId', 'unit_content_site_id'],
      },
      {
        keys: ['contextType', 'context_type'],
      },
      {
        keys: ['contextKey', 'context_key'],
      },
      {
        keys: 'site',
        toEntityFn: (data, key) => this.buildSite(data[key]),
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

  private buildSite(site?: {
    id: number;
    unit_id: number;
    name: string;
    original_filename: string;
    root_dir: string;
    root_dir_options: string[];
    is_main: boolean;
    created_at: string;
    updated_at: string;
  }): UnitContentSite | undefined {
    if (!site) {
      return undefined;
    }

    return new UnitContentSite({
      id: site.id,
      unitId: site.unit_id,
      name: site.name,
      originalFilename: site.original_filename,
      rootDir: site.root_dir,
      rootDirOptions: site.root_dir_options,
      isMain: site.is_main,
      createdAt: site.created_at,
      updatedAt: site.updated_at,
    });
  }
}
