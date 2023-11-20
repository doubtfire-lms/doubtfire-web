import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiiActionLogComponent } from './tii-action-log.component';

describe('TiiActionLogComponent', () => {
  let component: TiiActionLogComponent;
  let fixture: ComponentFixture<TiiActionLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TiiActionLogComponent]
    });
    fixture = TestBed.createComponent(TiiActionLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
