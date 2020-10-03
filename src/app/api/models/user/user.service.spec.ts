import { TestBed, getTestBed, tick, fakeAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from './user';
import { HttpRequest } from '@angular/common/http/http';

describe('UserService', () => {
  let injector: TestBed;
  let userService: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    injector = getTestBed();
    userService = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return expected users (HttpClient called once)', fakeAsync(() => {
    const u = new User();
    u.updateFromJson({
      id: 1,
      name: 'jake',
      last_name: 'renzella',
      first_name: 'Jake',
      nickname: 'jake',
      system_role: 'admin',
      has_run_first_time_setup: false,
      email: 'jake@jake.jake',
      student_id: '1',
      username: 'test',
      opt_in_to_research: true,
      receive_portfolio_notifications: false,
      receive_feedback_notifications: false,
      receive_task_notifications: false,
    });
    const expectedUsers: User[] = [u];

    userService.query().subscribe((users) => expect(users).toEqual(expectedUsers, 'expected users'));

    const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/');
      expect(request.method).toBe('GET');
      return true;
    });
    req.flush(u);
    tick();
  }));

  it('should create a new user', fakeAsync(() => {
    const user = new User();
    user.updateFromJson({
      name: 'jake',
      last_name: 'renzella',
      first_name: 'Jake',
      nickname: 'jake',
      system_role: 'admin',
      has_run_first_time_setup: false,
      email: 'jake@jake.jake',
      student_id: '1',
      username: 'test',
      opt_in_to_research: true,
      receive_portfolio_notifications: false,
      receive_feedback_notifications: false,
      receive_task_notifications: false,
    });

    userService.create(user).subscribe((result) => {
      expect(result).toEqual(user, 'expected users');
    });

    const expectedUser = user;
    expectedUser.id = 1;

    const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/');
      expect(request.method).toBe('POST');

      return true;
    });
    req.flush(expectedUser);
    tick();
  }));

  it('should delete a user', fakeAsync(() => {
    // let user = new User();
    // user.updateFromJson({
    //   name: 'jake', last_name: 'renzella', first_name: 'Jake', nickname: 'jake',
    //   system_role: 'admin', has_run_first_time_setup: false, email: 'jake@jake.jake',
    //   student_id: '1', username: 'test', opt_in_to_research: true, receive_portfolio_notifications: false,
    //   receive_feedback_notifications: false, receive_task_notifications: false
    // });
    // userService.delete(1).subscribe(
    //   result => expect(result).toEqual(user, 'expected users')
    // );
    // const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
    //   expect(request.url).toEqual('http://localhost:3000/api/users/1');
    //   expect(request.method).toBe('DELETE');
    //   return true;
    // });
    // req.flush(user);
    // tick();
  }));

  it('Test updating a User', fakeAsync(() => {
    const u = new User();
    u.updateFromJson({
      id: 1,
      name: 'jake',
      last_name: 'renzella',
      first_name: 'Jake',
      nickname: 'jake',
      system_role: 'admin',
      email: 'jake@jake.jake',
      student_id: '1',
      username: 'test',
    });

    userService.update(u).subscribe((result) => {
      expect(result.first_name).toBe(u.first_name);
    }, fail);

    let req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('PUT');
      return true;
    });
    req.flush(u);
    tick();

    u.first_name = 'andrew';
    userService.update(u).subscribe((result) => {
      expect(result.first_name).toBe('andrew');
    }, fail);

    req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('PUT');
      return true;
    });
    req.flush(u);
    tick();
  }));

  it('should cache the result of a get request', fakeAsync(() => {
    const user = new User();
    user.updateFromJson({
      name: 'jake',
      last_name: 'renzella',
      first_name: 'Jake',
      nickname: 'jake',
      system_role: 'admin',
      has_run_first_time_setup: false,
      email: 'jake@jake.jake',
      student_id: '1',
      username: 'test',
      opt_in_to_research: true,
      receive_portfolio_notifications: false,
      receive_feedback_notifications: false,
      receive_task_notifications: false,
    });

    userService.get(1).subscribe((data) => {});

    const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('GET');
      return true;
    });
    const user2 = user;
    user2.id = 1;
    req.flush(user2);
    tick();

    userService.get(1).subscribe((data) => {});

    httpMock.expectNone((request: HttpRequest<any>): boolean => {
      return true;
    });
    tick();
  }));

  it('should cache fetch/get', fakeAsync(() => {
    let user = new User();
    user.updateFromJson({
      name: 'jake',
      last_name: 'renzella',
      first_name: 'Jake',
      nickname: 'jake',
      system_role: 'admin',
      has_run_first_time_setup: false,
      email: 'jake@jake.jake',
      student_id: '1',
      username: 'test',
      opt_in_to_research: true,
      receive_portfolio_notifications: false,
      receive_feedback_notifications: false,
      receive_task_notifications: false,
    });

    // 1 request here
    userService.get(1).subscribe((data) => {
      user = data;
    });

    let req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('GET');
      return true;
    });

    const user2 = new User();
    user2.updateFromJson(user);
    user2.id = 1;
    req.flush(user2);
    tick();

    let user3;

    // 1 request here
    userService.fetch(1).subscribe((data) => {
      expect(data).toBe(user);
      user3 = data;
    });

    req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('GET');
      return true;
    });
    const user4 = new User();
    user4.updateFromJson(user2);
    user4.name = 'fred';
    req.flush(user4);

    httpMock.expectNone((request: HttpRequest<any>): boolean => {
      return true;
    });
    tick();
  }));
});
