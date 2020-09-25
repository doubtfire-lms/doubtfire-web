import { TestBed, getTestBed, tick, fakeAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CampusService } from './campus.service';
import { Campus } from './campus';
import { HttpRequest } from '@angular/common/http/http';

describe('CampusService', () => {
  let injector: TestBed;
  let campusService: CampusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CampusService],
    });

    injector = getTestBed();
    campusService = TestBed.inject(CampusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return expected campuses (HttpClient called once)', fakeAsync(() => {
    const c = new Campus();
    c.updateFromJson({
      name: 'Melbourne',
      mode: 'automatic',
      abbreviation: 'melb',
    });
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
