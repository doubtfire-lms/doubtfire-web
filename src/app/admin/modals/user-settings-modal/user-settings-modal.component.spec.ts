import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserSettingsModalComponent } from './user-settings-modal.component';

describe('UserSettingsModalComponent', () => {
  let component: UserSettingsModalComponent;
  let fixture: ComponentFixture<UserSettingsModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UserSettingsModalComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
