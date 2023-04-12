import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScormComponent } from './scorm-wrapper.component';

describe('ScormComponentComponent', () => {
  let component: ScormComponent;
  let fixture: ComponentFixture<ScormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
