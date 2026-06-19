import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  HttpRequest,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {User, UserService} from 'src/app/api/models/doubtfire-model';

describe('UserService', () => {
  let userService: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        UserService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    userService = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return expected users (HttpClient called once)', () => {
    const u = new User();
    u.id = 1;
    u.lastName = 'renzella';
    u.firstName = 'Jake';
    u.nickname = 'jake';
    u.hasRunFirstTimeSetup = false;
    u.email = 'jake@jake.jake';
    u.studentId = '1';
    u.username = 'test';
    u.optInToResearch = true;
    u.receivePortfolioNotifications = false;
    u.receiveFeedbackNotifications = false;
    u.receiveTaskNotifications = false;

    userService.query().subscribe((users) => {
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        id: 1,
        firstName: 'Jake',
        lastName: 'renzella',
        email: 'jake@jake.jake',
      });
    });

    const req = httpMock.expectOne((request: HttpRequest<object>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/');
      expect(request.method).toBe('GET');
      return true;
    });
    req.flush({
      id: 1,
      last_name: 'renzella',
      first_name: 'Jake',
      nickname: 'jake',
      has_run_first_time_setup: false,
      email: 'jake@jake.jake',
      student_id: '1',
      username: 'test',
      opt_in_to_research: true,
      receive_portfolio_notifications: false,
      receive_feedback_notifications: false,
      receive_task_notifications: false,
    });
  });

  it('should create a new user', () => {
    const user = new User();
    user.lastName = 'renzella';
    user.firstName = 'Jake';
    user.nickname = 'jake';
    user.hasRunFirstTimeSetup = false;
    user.email = 'jake@jake.jake';
    user.studentId = '1';
    user.username = 'test';
    user.optInToResearch = true;
    user.receivePortfolioNotifications = false;
    user.receiveFeedbackNotifications = false;
    user.receiveTaskNotifications = false;

    userService.create(user).subscribe((result) => {
      expect(result).toMatchObject({
        id: 1,
        firstName: 'Jake',
        lastName: 'renzella',
        email: 'jake@jake.jake',
      });
    });

    const req = httpMock.expectOne((request: HttpRequest<object>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/');
      expect(request.method).toBe('POST');

      return true;
    });
    req.flush({
      id: 1,
      last_name: 'renzella',
      first_name: 'Jake',
      nickname: 'jake',
      has_run_first_time_setup: false,
      email: 'jake@jake.jake',
      student_id: '1',
      username: 'test',
      opt_in_to_research: true,
      receive_portfolio_notifications: false,
      receive_feedback_notifications: false,
      receive_task_notifications: false,
    });
  });

  // it.skip('should delete a user', () => {
  // let user = new User();
  // user.updateFromJson({
  //   name: 'jake', lastName: 'renzella', firstName: 'Jake', nickname: 'jake',
  //   systemRole: 'admin', hasRunFirstTimeSetup: false, email: 'jake@jake.jake',
  //   student_id: '1', username: 'test', optInToResearch: true, receivePortfolioNotifications: false,
  //   receiveFeedbackNotifications: false, receiveTaskNotifications: false
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
  // });

  it('should update a User', () => {
    const u = new User();
    u.id = 1;
    u.lastName = 'renzella';
    u.firstName = 'Jake';
    u.nickname = 'jake';
    u.hasRunFirstTimeSetup = false;
    u.email = 'jake@jake.jake';
    u.studentId = '1';
    u.username = 'test';
    u.optInToResearch = true;
    u.receivePortfolioNotifications = false;
    u.receiveFeedbackNotifications = false;
    u.receiveTaskNotifications = false;

    userService.update(u).subscribe(
      (result) => {
        expect(result.firstName).toBe(u.firstName);
      },
      (error) => {
        throw error;
      },
    );

    let req = httpMock.expectOne((request: HttpRequest<object>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('PUT');
      return true;
    });
    req.flush(u);

    u.firstName = 'andrew';
    userService.update(u).subscribe({
      next: (result) => {
        expect(result.firstName).toBe('andrew');
      },
      error: (error) => {
        throw error;
      },
    });

    req = httpMock.expectOne((request: HttpRequest<object>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('PUT');
      return true;
    });

    req.flush(u);
  });

  it('should cache the result of a get request', () => {
    const user = new User();
    user.id = 1;
    user.lastName = 'renzella';
    user.firstName = 'Jake';
    user.nickname = 'jake';
    user.hasRunFirstTimeSetup = false;
    user.email = 'jake@jake.jake';
    user.studentId = '1';
    user.username = 'test';
    user.optInToResearch = true;
    user.receivePortfolioNotifications = false;
    user.receiveFeedbackNotifications = false;
    user.receiveTaskNotifications = false;

    userService.get(1).subscribe();

    const req = httpMock.expectOne((request: HttpRequest<object>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('GET');
      return true;
    });
    const user2 = user;
    user2.id = 1;
    req.flush(user2);

    userService.get(1).subscribe();

    httpMock.expectNone((_request: HttpRequest<object>): boolean => {
      return true;
    });
  });

  it('should cache fetch/get', () => {
    let user = new User();
    user.id = 1;
    user.lastName = 'renzella';
    user.firstName = 'Jake';
    user.nickname = 'jake';
    user.hasRunFirstTimeSetup = false;
    user.email = 'jake@jake.jake';
    user.studentId = '1';
    user.username = 'test';
    user.optInToResearch = true;
    user.receivePortfolioNotifications = false;
    user.receiveFeedbackNotifications = false;
    user.receiveTaskNotifications = false;

    // 1 request here
    userService.get(1).subscribe((data) => {
      user = data;
    });

    let req = httpMock.expectOne((request: HttpRequest<object>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('GET');
      return true;
    });

    const user2 = new User();
    Object.keys(user).forEach((key) => (user2[key] = user[key]));
    user2.id = 1;
    req.flush(user2);

    let user3: User;

    // 1 request here
    userService.fetch(1).subscribe((data) => {
      expect(data).toBe(user);
      user3 = data;
    });

    req = httpMock.expectOne((request: HttpRequest<object>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('GET');
      return true;
    });

    const user4 = new User();
    Object.keys(user2).forEach((key) => (user4[key] = user2[key]));
    user4.firstName = 'fred';
    req.flush(user4);
    expect(user3).toBe(user);

    httpMock.expectNone((_request: HttpRequest<object>): boolean => {
      return true;
    });
  });
});
