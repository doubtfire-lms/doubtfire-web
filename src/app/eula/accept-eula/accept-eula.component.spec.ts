import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {EMPTY} from 'rxjs';
import {UserService} from 'src/app/api/models/doubtfire-model';
import {TiiService} from 'src/app/api/services/tii.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {AcceptEulaComponent} from './accept-eula.component';

const constantsStub = {
  ExternalName: EMPTY,
  IsTiiEnabled: EMPTY,
};
const emptyProvider = {};

describe('AcceptEulaComponent', () => {
  let component: AcceptEulaComponent;
  let fixture: ComponentFixture<AcceptEulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AcceptEulaComponent],
      providers: [
        {provide: DoubtfireConstants, useValue: constantsStub},
        {provide: TiiService, useValue: emptyProvider},
        {provide: UserService, useValue: emptyProvider},
        {provide: AlertService, useValue: emptyProvider},
        {provide: Router, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AcceptEulaComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptEulaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
