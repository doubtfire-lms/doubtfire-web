import { TestBed, tick, fakeAsync } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Campus } from 'src/app/api/models/doubtfire-model';
import { CampusService } from '../campus.service';
import { HttpRequest, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CampusService', () => {
  let campusService: CampusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [CampusService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    campusService = TestBed.inject(CampusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return expected campuses (HttpClient called once)', fakeAsync(() => {
    const c = new Campus();

    c.name = 'Melbourne';
    c.mode = 'automatic';
    c.abbreviation = 'melb';

    const expectedCampuses: Campus[] = [c];

    campusService.query().subscribe((campuses) => expect(campuses).toEqual(expectedCampuses, 'expected campuses'));

    const req = httpMock.expectOne((request: HttpRequest<any>): boolean => {
      expect(request.url).toEqual('http://localhost:3000/api/campuses/');
      expect(request.method).toBe('GET');
      return true;
    });

    c.id = 1;
    req.flush(c);

    tick();
  }));
});
