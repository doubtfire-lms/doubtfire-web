import { Entity, EntityMapping } from 'ngx-entity-service';

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
  systemRole: string;
  receiveTaskNotifications: boolean;
  receivePortfolioNotifications: boolean;
  receiveFeedbackNotifications: boolean;
  hasRunFirstTimeSetup: boolean;
  authenticationToken: string;

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      user: super.toJson(mappingData, ignoreKeys)
    };
  }

  public get role(): string {
    return this.systemRole;
  }

  public get name(): string {
    const fn = this.firstName.slice(0, 11);
    const sn = this.lastName.slice(0, 11);
    const nn = this.nickname && this.nickname.trim() ? ` (${this.nickname.trim().slice(0, 11)})` : '';
    return `${fn} ${sn}${nn}`;
  }
}
