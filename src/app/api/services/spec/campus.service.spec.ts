import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  HttpRequest,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {Campus} from 'src/app/api/models/doubtfire-model';
import {CampusService} from '../campus.service';

describe('CampusService', () => {
  let campusService: CampusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        CampusService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    campusService = TestBed.inject(CampusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return expected campuses (HttpClient called once)', () => {
    const c = new Campus();

    c.name = 'Melbourne';
    c.mode = 'automatic';
    c.abbreviation = 'melb';

    campusService.query().subscribe((campuses) => {
      expect(campuses).toHaveLength(1);
      expect(campuses[0]).toMatchObject({
        id: 1,
        name: 'Melbourne',
        mode: 'automatic',
        abbreviation: 'melb',
      });
    });

    const req = httpMock.expectOne((request: HttpRequest<object>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/campuses/');
      expect(request.method).toBe('GET');
      return true;
    });

    c.id = 1;
    req.flush(c);
  });
});
