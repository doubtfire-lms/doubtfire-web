import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScormPlayerComponent } from './scorm-player.component';

describe('ScormPlayerComponent', () => {
  let component: ScormPlayerComponent;
  let fixture: ComponentFixture<ScormPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScormPlayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScormPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
