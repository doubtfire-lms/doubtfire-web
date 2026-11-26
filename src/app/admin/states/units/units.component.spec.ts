import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {UnitService} from 'src/app/api/services/unit.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {CreateNewUnitModal} from '../../modals/create-new-unit-modal/create-new-unit-modal.component';
import {FUnitsComponent} from './units.component';

const emptyProvider = {};

describe('FUnitsComponent', () => {
  let component: FUnitsComponent;
  let fixture: ComponentFixture<FUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FUnitsComponent],
      providers: [
        {provide: CreateNewUnitModal, useValue: emptyProvider},
        {provide: GlobalStateService, useValue: emptyProvider},
        {provide: UnitService, useValue: emptyProvider},
        {provide: ActivatedRoute, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(FUnitsComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FUnitsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
