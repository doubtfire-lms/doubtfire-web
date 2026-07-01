import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {PrivacyPolicy} from './privacy-policy';

describe('PrivacyPolicy', () => {
  let service: PrivacyPolicy;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    service = TestBed.inject(PrivacyPolicy);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load the privacy and plagiarism policies', () => {
    httpMock
      .expectOne('http://localhost:3000/api/settings/privacy')
      .flush({privacy: 'Privacy policy', plagiarism: 'Plagiarism policy'});

    expect(service).toBeTruthy();
    expect(service.privacy).toBe('Privacy policy');
    expect(service.plagiarism).toBe('Plagiarism policy');
    expect(service.loaded).toBe(true);
  });
});
