import { TestBed } from '@angular/core/testing';

import {PrivacyPolicy } from './privacy-policy';

describe('PrivacyPolicy', () => {
  let service: PrivacyPolicy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivacyPolicy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});