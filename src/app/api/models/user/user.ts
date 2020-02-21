import { Entity } from '../entity';

export type Tutor = User;

const KEYS =
  [
    'id',
    'name',
    'first_name',
    'last_name',
    'opt_in_to_research',
    'student_id',
    'email',
    'username',
    'nickname',
    'system_role',
    'receive_task_notifications',
    'receive_portfolio_notifications',
    'receive_feedback_notifications',
    'has_run_first_time_setup',
  ];

export class User extends Entity {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  opt_in_to_research: boolean;
  student_id: string;
  email: string;
  username: string;
  nickname: string;
  system_role: string;
  receive_task_notifications: boolean;
  receive_portfolio_notifications: boolean;
  receive_feedback_notifications: boolean;
  has_run_first_time_setup: boolean;

  toJson(): any {
    return {
      user: super.toJsonWithKeys(KEYS)
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
}
