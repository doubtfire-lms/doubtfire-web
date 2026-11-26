import {beforeEach, describe, expect, it} from 'vitest';
import {Location} from '@angular/common';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UnauthorisedComponent} from './unauthorised.component';

const emptyProvider = {};

describe('UnauthorisedComponent', () => {
  let component: UnauthorisedComponent;
  let fixture: ComponentFixture<UnauthorisedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnauthorisedComponent],
      providers: [{provide: Location, useValue: emptyProvider}],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(UnauthorisedComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnauthorisedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
