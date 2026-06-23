import {Entity, EntityMapping} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

export type Tutor = User;

export class User extends Entity {
  public id: number;
  public firstName: string;
  public lastName: string;
  public optInToResearch: boolean;
  public studentId: string;
  public email: string;
  public username: string;
  public nickname: string;
  public systemRole: 'Admin' | 'Convenor' | 'Tutor' | 'Student' | 'Auditor';
  public receiveTaskNotifications: boolean;
  public receivePortfolioNotifications: boolean;
  public receiveFeedbackNotifications: boolean;
  public hasRunFirstTimeSetup: boolean;
  public authenticationToken: string;
  public authenticationTokenExpiry: string;
  public pronouns: string | null;
  public acceptedTiiEula: boolean;

  // LTI Token
  public ltik: string;

  public override toJson<T extends Entity>(
    mappingData: EntityMapping<T>,
    ignoreKeys?: string[],
  ): object {
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
    const fn = (this.firstName ?? '').slice(0, 11).trim();
    const sn = (this.lastName ?? '').slice(0, 11).trim();
    const nn =
      this.nickname && this.nickname.trim() ? ` (${this.nickname.trim().slice(0, 11).trim()})` : '';
    return `${fn} ${sn}${nn}`.trim();
  }

  public get preferredName(): string {
    const nickname = this.nickname?.trim();
    const firstName = this.firstName?.trim() ?? '';
    if (nickname) {
      return nickname;
    }
    return firstName;
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
    return httpClient.put(uri, {}).pipe(
      map(() => {
        this.acceptedTiiEula = true;
        // AppInjector.get(AuthenticationService).saveCurrentUser();
        return true;
      }),
    );
  }
}
