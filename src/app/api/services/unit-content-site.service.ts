import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Unit} from 'src/app/api/models/unit';
import {UnitContentSite} from 'src/app/api/models/unit-content-link';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class UnitContentSiteService extends CachedEntityService<UnitContentSite> {
  protected readonly endpointFormat = 'units/:unitId:/content/sites/:id:';
  private readonly collectionEndpointFormat = 'units/:unitId:/content/sites';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'unitId',
      'name',
      'originalFilename',
      'rootDir',
      'rootDirOptions',
      'isMain',
      'createdAt',
      'updatedAt',
    );
  }

  public getForUnit(unit: Unit): Observable<UnitContentSite[]> {
    return this.query({unitId: unit.id}, {endpointFormat: this.collectionEndpointFormat});
  }

  public uploadForUnit(unit: Unit, file: File): Observable<UnitContentSite> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('name', file.name.replace(/\.[^.]+$/, ''));

    return this.create(
      {unitId: unit.id},
      {
        body: formData,
        endpointFormat: this.collectionEndpointFormat,
      },
    );
  }

  public replaceArchiveForUnit(
    unit: Unit,
    site: UnitContentSite,
    file: File,
  ): Observable<UnitContentSite> {
    const formData = new FormData();

    formData.append('file', file);

    return this.update(
      {unitId: unit.id, id: site.id},
      {
        body: formData,
        entity: site,
        endpointFormat: this.endpointFormat,
      },
    );
  }

  public deleteForUnit(unit: Unit, site: UnitContentSite): Observable<boolean> {
    return this.delete<boolean>({unitId: unit.id, id: site.id});
  }

  public updateForUnit(
    unit: Unit,
    site: UnitContentSite,
    changes: Partial<Pick<UnitContentSite, 'name' | 'rootDir' | 'isMain'>>,
  ): Observable<UnitContentSite> {
    return this.update(
      {unitId: unit.id, id: site.id},
      {
        entity: site,
        body: {
          name: changes.name,
          root_dir: changes.rootDir,
          is_main: changes.isMain,
        },
      },
    );
  }

  public override createInstanceFrom(_json: object): UnitContentSite {
    return new UnitContentSite();
  }
}
