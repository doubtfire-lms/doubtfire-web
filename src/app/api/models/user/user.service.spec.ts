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
      providers: [UserService]
    });

    injector = getTestBed();
    userService = injector.get(UserService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return expected users (HttpClient called once)', fakeAsync(() => {
    let u = new User();
    u.updateFromJson({
      id: 1, name: 'jake', last_name: 'renzella', first_name: 'Jake', nickname: 'jake',
      system_role: 'admin', has_run_first_time_setup: false, email: 'jake@jake.jake',
      student_id: '1', username: 'test', opt_in_to_research: true, receive_portfolio_notifications: false,
      receive_feedback_notifications: false, receive_task_notifications: false
    });
    const expectedUsers: User[] =
      [u];

    userService.query().subscribe(
      users => expect(users).toEqual(expectedUsers, 'expected users')
    );

    const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/');
      expect(request.method).toBe('GET');
      return true;
    });
    req.flush(u);
    tick();
  }));

  it('should create a new user', fakeAsync(() => {
    let user = new User();
    user.updateFromJson({
      name: 'jake', last_name: 'renzella', first_name: 'Jake', nickname: 'jake',
      system_role: 'admin', has_run_first_time_setup: false, email: 'jake@jake.jake',
      student_id: '1', username: 'test', opt_in_to_research: true, receive_portfolio_notifications: false,
      receive_feedback_notifications: false, receive_task_notifications: false
    });

    userService.create(user).subscribe(
      result => {
        let expectedUser = user;
        expectedUser.id = 1;
        expect(result).toEqual(expectedUser, 'expected users');
      }
    );

    const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/');
      expect(request.method).toBe('POST');
      return true;
    });
    req.flush(user);
    tick();
  }));

  it('should delete a user', fakeAsync(() => {
    let user = new User();
    user.updateFromJson({
      name: 'jake', last_name: 'renzella', first_name: 'Jake', nickname: 'jake',
      system_role: 'admin', has_run_first_time_setup: false, email: 'jake@jake.jake',
      student_id: '1', username: 'test', opt_in_to_research: true, receive_portfolio_notifications: false,
      receive_feedback_notifications: false, receive_task_notifications: false
    });

    userService.delete(1).subscribe(
      result => expect(result).toEqual(user, 'expected users')
    );

    const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('DELETE');
      return true;
    });
    req.flush(user);
    tick();
  }));


  it('Test updating a User', fakeAsync(() => {
    let u = new User();
    u.updateFromJson({
      id: 1, name: 'jake', last_name: 'renzella', first_name: 'Jake', nickname: 'jake',
      system_role: 'admin', email: 'jake@jake.jake', student_id: '1', username: 'test'
    });

    userService.update(u).subscribe(
      result => {
        expect(result.first_name).toBe(u.first_name);
      },
      fail);

    let req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('PUT');
      return true;
    });
    req.flush(u);
    tick();

    u.first_name = 'andrew';
    userService.update(u).subscribe(
      result => {
        expect(result.first_name).toBe('andrew');
      },
      fail);

    req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('PUT');
      return true;
    });
    req.flush(u);
    tick();
  }));

  it('should cache the result of a get request', fakeAsync(() => {
    let user = new User();
    user.updateFromJson({
      name: 'jake', last_name: 'renzella', first_name: 'Jake', nickname: 'jake',
      system_role: 'admin', has_run_first_time_setup: false, email: 'jake@jake.jake',
      student_id: '1', username: 'test', opt_in_to_research: true, receive_portfolio_notifications: false,
      receive_feedback_notifications: false, receive_task_notifications: false
    });

    userService.get(1).subscribe(
      result => expect(result).toEqual(user, 'expected users')
    );

    userService.get(1).subscribe(
      result => expect(result).toEqual(user, 'expected users')
    );

    userService.get(1).subscribe(
      result => expect(result).toEqual(user, 'expected users')
    );

    const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('GET');
      return true;
    });
    req.flush(user);
    tick();
  }));
});


  // it('#Create a new user using the UserService', () => {
  //   let userService: UserService = TestBed.get(UserService);
  //   userService.get(1).subscribe(data => {
  //     console.log(data);
  //     expect(data).toBe(new User())
  //   });
  // });

  // it('#Update an existing User', () => {
  //   let userService: UserService = TestBed.get(UserService);
  //   userService.get(1).subscribe(data => {
  //     data.first_name = 'Applebee';
  //     userService.update(data).subscribe(result => expect(result).toBe(data));
  //   });
  // });
// });
