import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FTaskSheetViewComponent} from './task-sheet-view.component';

describe('FTaskSheetViewComponent', () => {
  let component: FTaskSheetViewComponent;
  let fixture: ComponentFixture<FTaskSheetViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FTaskSheetViewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(FTaskSheetViewComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FTaskSheetViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
