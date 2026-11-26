import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {HeroSidebarComponent} from './hero-sidebar.component';

describe('HeroSidebarComponent', () => {
  let component: HeroSidebarComponent;
  let fixture: ComponentFixture<HeroSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeroSidebarComponent],
      providers: [
        {
          provide: DoubtfireConstants,
          useValue: {ExternalName: new BehaviorSubject<string>('Doubtfire')},
        },
      ],
    }).compileComponents();
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
