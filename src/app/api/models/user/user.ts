import { HttpClient } from '@angular/common/http';
import { Entity, EntityMapping } from 'ngx-entity-service';
import { Observable, map } from 'rxjs';
import { AppInjector } from 'src/app/app-injector';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { AuthenticationService } from '../doubtfire-model';

export type Tutor = User;

export class User extends Entity {
  id: number;
  firstName: string;
  lastName: string;
  optInToResearch: boolean;
  studentId: string;
  email: string;
  username: string;
  nickname: string;
  systemRole: 'Admin' | 'Convenor' | 'Tutor' | 'Student';
  receiveTaskNotifications: boolean;
  receivePortfolioNotifications: boolean;
  receiveFeedbackNotifications: boolean;
  hasRunFirstTimeSetup: boolean;
  authenticationToken: string;
  pronouns: string | null;
  acceptedTiiEula: boolean;

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      user: super.toJson(mappingData, ignoreKeys),
    };
  }

  public get role(): string {
    return this.systemRole;
  }

  public get isStaff(): boolean {
    return ['Tutor', 'Convenor', 'Admin'].includes(this.systemRole);
  }

  public get name(): string {
    const fn = this.firstName.slice(0, 11);
    const sn = this.lastName.slice(0, 11);
    const nn = this.nickname && this.nickname.trim() ? ` (${this.nickname.trim().slice(0, 11)})` : '';
    return `${fn} ${sn}${nn}`;
  }

  public matches(text: string): boolean {
    return (
      this.studentId?.toLowerCase().indexOf(text) >= 0 ||
      this.name.toLowerCase().indexOf(text) >= 0 ||
      this.firstName.toLowerCase().indexOf(text) >= 0 ||
      this.lastName.toLowerCase().indexOf(text) >= 0 ||
      this.email.toLowerCase().indexOf(text) >= 0 ||
      this.nickname?.toLowerCase().indexOf(text) >= 0
    );
  }

  public acceptTiiEula(): Observable<boolean> {
    const httpClient = AppInjector.get(HttpClient);
    const uri = `${AppInjector.get(DoubtfireConstants).API_URL}/tii_eula/users/${this.id}/accept`;
    return httpClient.put(uri, {}).pipe(map(() => {
      this.acceptedTiiEula = true;
      AppInjector.get(AuthenticationService).saveCurrentUser();
      return true;
    }));
  }
}
