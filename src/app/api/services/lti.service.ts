import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CsvResult} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import LTI_API_URL from 'src/app/config/constants/ltiApiUrl';
import {Project} from '../models/project';
import {SidekiqJob} from '../models/sidekiq-job';

interface info {
  name?: string;
  email?: string;
  roles?: string[];
  custom?: Record<string, string>;
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
  lineItemId?: string;
}

export interface GradeLineItemStatus {
  configured: boolean;
  visibility: 'unknown';
  reason?: 'service_not_enabled' | 'line_item_missing' | 'line_item_unavailable';
  message?: string;
  lineItem?: {
    id: string;
    label: string;
    scoreMaximum: number;
  };
}

export interface AppHandoff {
  username: string;
  authToken: string;
}

export interface LtiMembers {
  members: LtiMember[];
}

export interface LtiMember {
  email: string;
  family_name: string;
  given_name: string;
  name: string;
  user_id: string;
  roles: string[];
}

@Injectable()
export class LtiService {
  constructor(private httpClient: HttpClient) {}

  public getInfo(): Observable<info> {
    return this.httpClient.get<info>(`${LTI_API_URL}/info`);
  }

  public createAppHandoff(): Observable<AppHandoff> {
    return this.httpClient.post<AppHandoff>(`${LTI_API_URL}/app-handoff`, {});
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

  public getGradeLineItemStatus(): Observable<GradeLineItemStatus> {
    return this.httpClient.get<GradeLineItemStatus>(`${LTI_API_URL}/grade-line-item`);
  }

  public retryGradeLineItem(): Observable<GradeLineItemStatus> {
    return this.httpClient.post<GradeLineItemStatus>(`${LTI_API_URL}/grade-line-item`, {});
  }

  public enrolUser(unit: UnitLink): Observable<Project | null> {
    return this.httpClient.post<Project | null>(`${LTI_API_URL}/enrol`, unit);
  }

  public getMembers(): Observable<LtiMembers> {
    return this.httpClient.get<LtiMembers>(`${LTI_API_URL}/members`);
  }

  // Sync grades for all members in the context (course)
  public syncStudentsGrades(): Observable<CsvResult> {
    return this.httpClient.post<CsvResult>(`${LTI_API_URL}/grades`, {});
  }

  // Sync grades for all members in the context (course)
  public syncEnrolments(): Observable<SidekiqJob> {
    return this.httpClient.post<SidekiqJob>(`${LTI_API_URL}/enrolments`, {});
  }
}
