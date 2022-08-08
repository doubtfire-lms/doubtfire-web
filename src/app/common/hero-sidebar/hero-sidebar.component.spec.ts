import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroSidebarComponent } from './hero-sidebar.component';

describe('HeroSidebarComponent', () => {
  let component: HeroSidebarComponent;
  let fixture: ComponentFixture<HeroSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeroSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
