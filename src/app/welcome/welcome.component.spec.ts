import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeWizardComponent } from './welcome-wizard.component';

describe('WelcomeWizardComponent', () => {
  let component: WelcomeWizardComponent;
  let fixture: ComponentFixture<WelcomeWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WelcomeWizardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
