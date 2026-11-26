import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TiiActionService} from 'src/app/api/services/tii-action.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TiiActionLogComponent} from './tii-action-log.component';

const emptyProvider = {};

describe('TiiActionLogComponent', () => {
  let component: TiiActionLogComponent;
  let fixture: ComponentFixture<TiiActionLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TiiActionLogComponent],
      providers: [
        {provide: TiiActionService, useValue: emptyProvider},
        {provide: AlertService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TiiActionLogComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiiActionLogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
