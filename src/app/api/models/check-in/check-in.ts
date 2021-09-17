import { AppInjector } from 'src/app/app-injector';
import { Project, User } from '../doubtfire-model';
import { Entity } from '../entity';
import { Tutorial } from '../tutorial/tutorial';
import { CheckInService } from './check-in.service';

const KEYS = ['id', 'card', 'username', 'seat'];

export class CheckIn extends Entity {
  id: number;
  card: number;
  username: string;
  seat: string;
  user: Project;

  public static checkoutEveryone(tutorial: Tutorial, room_number: string) {
    const cis: CheckInService = AppInjector.get(CheckInService);
    return cis.checkoutEveryone(tutorial.id, room_number);
  }

  toJson(): any {
    return {
      id: this.id,
      id_card_id: this.card,
      username: this.username,
    };
  }

  public updateFromJson(data: any): void {
    this.setFromJson(data, KEYS);
  }
  public get key(): string {
    return this.id.toString();
  }
  public keyForJson(json: any): string {
    return json.id;
  }

  constructor(initialData: object, unit: any) {
    super(); // delay update from json
    if (initialData) {
      this.updateFromJson(initialData);
    }

    // Find the user...
    if (this.username && unit) {
      this.user = unit.findStudentUsername(this.username);
    }
  }

  assignUserToIdCard(user: Project) {
    const cis: CheckInService = AppInjector.get(CheckInService);
    return cis.assignUserToIdCard(this, user);
  }

  checkout() {
    const cis: CheckInService = AppInjector.get(CheckInService);
    return cis.checkout(this);
  }
}
