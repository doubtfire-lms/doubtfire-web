import { Entity, EntityMapping } from 'ngx-entity-service';

export type Tutor = User;

export class User extends Entity {
  id: number;
  name: string;
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

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      user: super.toJson(mappingData, ignoreKeys)
    };
  }

}
