import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsButtonComponent } from './notifications-button.component';

describe('NotificationsButtonComponent', () => {
  let component: NotificationsButtonComponent;
  let fixture: ComponentFixture<NotificationsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
