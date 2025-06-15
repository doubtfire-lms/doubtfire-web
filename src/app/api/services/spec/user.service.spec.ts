import { TestBed, tick, fakeAsync } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { User, UserService } from 'src/app/api/models/doubtfire-model';
import { HttpRequest, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { analyticsService } from 'src/app/ajs-upgraded-providers';

describe('UserService', () => {
  let userService: UserService;
  let httpMock: HttpTestingController;
  let analyticsServiceStub: jasmine.SpyObj<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [UserService, { provide: analyticsService, useValue: analyticsServiceStub }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    userService = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return expected users (HttpClient called once)', fakeAsync(() => {
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

  xit('should delete a user', fakeAsync(() => {
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
  }));

  it('should update a User', fakeAsync(() => {
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

    userService.update(u).subscribe((result) => {
      expect(result.firstName).toBe(u.firstName);
    }, fail);

    let req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('PUT');
      return true;
    });
    req.flush(u);
    tick();

    u.firstName = 'andrew';
    userService.update(u).subscribe({
      next: (result) => {
        expect(result.firstName).toBe('andrew');
      },
      error: fail,
    });

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

    let req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/users/1');
      expect(request.method).toBe('GET');
      return true;
    });

    const user2 = new User();
    Object.keys(user).forEach((key) => (user2[key] = user[key]));
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
    Object.keys(user2).forEach((key) => (user4[key] = user2[key]));
    user4.firstName = 'fred';
    req.flush(user4);

    httpMock.expectNone((request: HttpRequest<any>): boolean => {
      return true;
    });
    tick();
  }));
});
