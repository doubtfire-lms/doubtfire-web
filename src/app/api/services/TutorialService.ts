import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TutorialService } from './tutorial.service';
import { CampusService } from 'src/app/api/models/doubtfire-model';
import { UserService } from 'src/app/api/models/doubtfire-model';
import { analyticsService, alertService } from 'src/app/ajs-upgraded-providers';

describe('TutorialService', () => {
  let service: TutorialService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TutorialService,
        CampusService,
        UserService,
        { provide: analyticsService, useValue: {} },
        { provide: alertService, useValue: {} }
      ]
    });
    service = TestBed.inject(TutorialService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should switch tutorial for a project', () => {
    const mockProject = {
      id: 1,
      unit: {
        id: 2,
        tutorialsCache: {
          get: (id) => ({ id }),
          add: (tut) => {},
          delete: (tut) => {}
        },
        tutorialFromId: (id) => ({ id }),
        tutorialStreamForAbbr: (abbr) => ({ abbreviation: abbr })
      },
      tutorialEnrolmentsCache: {
        clear: () => {},
        add: (tut) => {},
        delete: (tut) => {}
      },
      student: {
        name: 'Alice'
      }
    };
    const mockTutorial = {
      id: 3,
      abbreviation: 'TUT1'
    };
    const mockResponse = {
      enrolments: [
        { tutorial_id: 3 }
      ]
    };

    spyOn(service.alertService, 'add');
    spyOn(mockProject.tutorialEnrolmentsCache, 'clear');
    spyOn(mockProject.tutorialEnrolmentsCache, 'add');
    spyOn(mockProject.unit.tutorialsCache, 'delete');

    service.switchTutorial(mockProject, mockTutorial, true);

    const req = httpMock.expectOne('units/2/tutorials/TUT1/enrolments/1');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.alertService.add).toHaveBeenCalledWith('success', 'Tutorial enrolment updated for Alice', 3000);
    expect(mockProject.tutorialEnrolmentsCache.clear).toHaveBeenCalled();
    expect(mockProject.tutorialEnrolmentsCache.add).toHaveBeenCalledWith({ id: 3 });
    expect(mockProject.unit.tutorialsCache.delete).not.toHaveBeenCalled();
  });
});
