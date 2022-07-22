import { Entity } from 'ngx-entity-service';

export class GroupMembership extends Entity {

  public get student_name(): string {
    console.log("implement student_name");
    return "TODO NAME";
  }
}
