import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import {Unit} from 'src/app/api/models/unit';
import {UnitContentSite} from 'src/app/api/models/unit-content-link';
import API_URL from 'src/app/config/constants/apiUrl';

interface UnitContentSiteDto {
  id: number;
  unit_id: number;
  name: string;
  original_filename: string;
  root_dir: string;
  root_dir_options: string[];
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class UnitContentSiteService {
  constructor(private httpClient: HttpClient) {}

  public getForUnit(unit: Unit): Observable<UnitContentSite[]> {
    return this.httpClient
      .get<UnitContentSiteDto[]>(this.endpoint(unit))
      .pipe(map((sites) => sites.map((site) => this.fromDto(site))));
  }

  public uploadForUnit(unit: Unit, file: File): Observable<UnitContentSite> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('name', file.name.replace(/\.[^.]+$/, ''));

    return this.httpClient
      .post<UnitContentSiteDto>(this.endpoint(unit), formData)
      .pipe(map((site) => this.fromDto(site)));
  }

  public deleteForUnit(unit: Unit, site: UnitContentSite): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${this.endpoint(unit)}/${site.id}`);
  }

  public updateForUnit(
    unit: Unit,
    site: UnitContentSite,
    changes: Partial<Pick<UnitContentSite, 'name' | 'rootDir' | 'isMain'>>,
  ): Observable<UnitContentSite> {
    return this.httpClient
      .put<UnitContentSiteDto>(`${this.endpoint(unit)}/${site.id}`, {
        name: changes.name,
        root_dir: changes.rootDir,
        is_main: changes.isMain,
      })
      .pipe(map((updatedSite) => this.fromDto(updatedSite)));
  }

  private endpoint(unit: Unit): string {
    return `${API_URL}/units/${unit.id}/content/sites`;
  }

  private fromDto(site: UnitContentSiteDto): UnitContentSite {
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
