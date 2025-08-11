import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import LTI_API_URL from 'src/app/config/constants/ltiApiUrl';
import {Project} from '../models/project';

interface info {
  name?: string;
  email?: string;
  roles?: string[];
  custom?: any;
  context?:
    | {
        id?: string;
        label?: string;
        title?: string;
        type?: string[];
      }
    | undefined;
}

export interface RetrievedGrade {
  id: string;
  scoreOf: string;
  userId: string;
  resultScore: number;
  resultMaximum: number;
  comment: string;
}

export interface UnitLink {
  contextId?: string;
  unitId: string;
}

@Injectable()
export class LtiService {
  constructor(private httpClient: HttpClient) {}

  // Sends a deeplink request to the LTI.js API (not the Ruby API).
  public sendDeeplinkRequest(data: {unit_id: string}): Observable<string> {
    return this.httpClient.post<string>(`${LTI_API_URL}/deeplink`, data);
  }

  // Sends a deeplink request to the LTI.js API (not the Ruby API).

  public getInfo(): Observable<info> {
    return this.httpClient.get<info>(`${LTI_API_URL}/info`);
  }

  public getUnitLink(): Observable<UnitLink> {
    return this.httpClient.get<UnitLink>(`${LTI_API_URL}/link`);
  }

  public setUnitLink(data: UnitLink): Observable<UnitLink> {
    return this.httpClient.post<UnitLink>(`${LTI_API_URL}/link`, data);
  }

  public removeUnitLink(): Observable<UnitLink> {
    return this.httpClient.delete<UnitLink>(`${LTI_API_URL}/link`);
  }

  public enrolUser(unit: UnitLink): Observable<Project | null> {
    return this.httpClient.post<Project | null>(`${LTI_API_URL}/enrol`, unit);
  }

  public getMembers(): Observable<any> {
    return this.httpClient.get<any>(`${LTI_API_URL}/members`);
  }

  // Sync grade for current student
  public syncGrade(): Observable<boolean> {
    return this.httpClient.post<boolean>(`${LTI_API_URL}/grades`, {});
  }

  // Sync grades for all members in the context (course)
  public syncStudentsGrades(): Observable<boolean> {
    return this.httpClient.post<boolean>(`${LTI_API_URL}/grades`, {});
  }

  public getGrade(): Observable<RetrievedGrade[] | null> {
    return this.httpClient.get<RetrievedGrade[] | null>(`${LTI_API_URL}/grade`, {});
  }
}
