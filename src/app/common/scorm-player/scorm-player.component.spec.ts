import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService, UserService} from 'src/app/api/models/doubtfire-model';
import {ScormAdapterService} from 'src/app/api/services/scorm-adapter.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {ScormPlayerComponent} from './scorm-player.component';

const emptyProvider = {};

describe('ScormPlayerComponent', () => {
  let component: ScormPlayerComponent;
  let fixture: ComponentFixture<ScormPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScormPlayerComponent],
      providers: [
        {provide: GlobalStateService, useValue: emptyProvider},
        {provide: ScormAdapterService, useValue: emptyProvider},
        {provide: UserService, useValue: emptyProvider},
        {provide: AuthenticationService, useValue: emptyProvider},
        {provide: DomSanitizer, useValue: emptyProvider},
        {provide: ActivatedRoute, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ScormPlayerComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScormPlayerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
