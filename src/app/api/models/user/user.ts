import { Resource } from '../resource';

export class User extends Resource {
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
}
