import {MediaObserver} from 'ng-flex-layout';
import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatMenuModule} from '@angular/material/menu';
import {UnitDropdownComponent} from './unit-dropdown.component';

describe('UnitDropdownComponent', () => {
  let component: UnitDropdownComponent;
  let fixture: ComponentFixture<UnitDropdownComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitDropdownComponent],
      imports: [MatMenuModule],
      providers: [{provide: MediaObserver, useValue: {isActive: () => false}}],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
