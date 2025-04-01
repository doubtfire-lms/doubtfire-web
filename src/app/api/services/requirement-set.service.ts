import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class RequirementSet {
  constructor(private http: HttpClient) {}

  private baseUrl: string = `${API_URL}/requirementset`;

  // Get requirement-sets
  getRequirementSets(): Observable<RequirementSet> {
    const url = `${this.baseUrl}`;
    return this.http.get<RequirementSet>(url);
  }

  getRequirementSetById(): Observable<RequirementSet> {
    const url = `${this.baseUrl}/:id:`;
    return this.http.get<RequirementSet>(url);
  }

  addNewRequirementSet(
    requirementSetGroupId: number,
    name: string,
    description: string,
    unitId: string,
    requirementId: number): Observable<RequirementSet> {
    const params = new HttpParams();

    params.set('requirementSetId', requirementSetGroupId.toString());
    params.set('name', name);
    params.set('description', description);
    params.set('unitId', unitId);
    params.set('requirementId', requirementId.toString());
    const url = `${this.baseUrl}`;
    return this.http.post<RequirementSet>(url, {params});
  }

  updateRequirementSet(
    requirementSetGroupId: number,
    name: string,
    description: string,
    code: string,): Observable<RequirementSet> {
    const params = new HttpParams();

    params.set('requirementSetId', requirementSetGroupId.toString());
    params.set('description', description);
    const url = `${this.baseUrl}`;
    return this.http.put<RequirementSet>(url, {params});
  }

  deleteRequirementSet(requirementSetGroupId: number): Observable<RequirementSet> {
    const url = `${this.baseUrl}/requirementSetId/${requirementSetGroupId}`;
    return this.http.delete<RequirementSet>(url);
  }

}
