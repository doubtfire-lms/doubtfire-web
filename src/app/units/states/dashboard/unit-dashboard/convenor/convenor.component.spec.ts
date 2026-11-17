import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConvenorComponent} from './convenor.component';

describe('ConvenorComponent', () => {
  let component: ConvenorComponent;
  let fixture: ComponentFixture<ConvenorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvenorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConvenorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
