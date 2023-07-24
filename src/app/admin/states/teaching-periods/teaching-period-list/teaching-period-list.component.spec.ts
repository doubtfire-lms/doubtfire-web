import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingPeriodListComponent } from './teaching-period-list.component';

describe('TeachingPeriodListComponent', () => {
  let component: TeachingPeriodListComponent;
  let fixture: ComponentFixture<TeachingPeriodListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeachingPeriodListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeachingPeriodListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
