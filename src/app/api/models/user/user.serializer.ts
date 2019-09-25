import { User } from './user';

export class UserSerializer {
  fromJson(json: any): User {
    const user = new User();
    user.id = json.id;
    user.name = json.name;
    user.first_name = json.first_name;
    user.last_name = json.last_name;
    user.opt_in_to_research = json.opt_in_to_research;
    user.student_id = json.student_id;
    user.email = json.email;
    user.username = json.username;
    user.nickname = json.nickname;
    user.system_role = json.system_role;
    user.receive_task_notifications = json.receive_task_notifications;
    user.receive_portfolio_notifications = json.receive_portfolio_notifications;
    user.receive_feedback_notifications = json.receive_feedback_notifications;
    user.has_run_first_time_setup = json.has_run_first_time_setup;
    return user;
  }

  toJson(user: User): any {
    return {
      user: {
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        opt_in_to_research: user.opt_in_to_research,
        student_id: user.student_id,
        email: user.email,
        username: user.username,
        nickname: user.nickname,
        system_role: user.system_role,
        receive_task_notifications: user.receive_task_notifications,
        receive_portfolio_notifications: user.receive_portfolio_notifications,
        receive_feedback_notifications: user.receive_feedback_notifications,
        has_run_first_time_setup: user.has_run_first_time_setup,
      }
    };
  }
}
