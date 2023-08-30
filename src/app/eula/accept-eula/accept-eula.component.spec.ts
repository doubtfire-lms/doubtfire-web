import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptEulaComponent } from './accept-eula.component';

describe('AcceptEulaComponent', () => {
  let component: AcceptEulaComponent;
  let fixture: ComponentFixture<AcceptEulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptEulaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptEulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
