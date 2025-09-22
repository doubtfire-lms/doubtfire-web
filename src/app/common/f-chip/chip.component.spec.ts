import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FChipComponent } from './chip.component';

describe('FChipComponent', () => {
  let component: FChipComponent;
  let fixture: ComponentFixture<FChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FChipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
