import { EntityService } from "../entity.service";
import { User } from "./user";
import { Observable } from "rxjs";

export class UserService extends EntityService<User> {

  protected readonly baseEndpoint = "users";

  protected endpoint(data: number): string;
  protected endpoint(data: string): string;
  protected endpoint(data: User): string;
  protected endpoint(data: Object): string {

    if (!data) {
      console.log("error");
    }
    let id: number;
    if (typeof data === "number") {
      id = data;
    } else if (data instanceof User) {
      id = (data as User).id;
    } else if (typeof data === "object") {
      id = data["id"];
    } else {
      id = data;
    }
    return `${this.baseEndpoint}/${id}`;
  }

  // public get(id: number): Observable<User> {
  //   return this.getEntity(id.toString(), this.endpoint(id));
  // }

  // public list(): Observable<User | User[]> {
  //   return super.list(this.baseEndpoint);
  // }

  private upgrade(item: any): User {
    return Object.setPrototypeOf(item, User.prototype);
  }

  public delete(item: any) {
    if (!(item instanceof User)) {
      this.upgrade(item);
    }
    return super.delete(item);
  }

  public update(item: any): Observable<User> {
    if (!(item instanceof User)) {
      this.upgrade(item);
    }
    return super.update(item);
  }

  protected createInstanceFrom(json: any): User {
    let user = new User();
    user.updateFromJson(json);
    return user;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
