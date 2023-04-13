import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScormService } from 'pipwerks-scorm-api-wrapper';
import { NumbasComponent } from './numbas.component';

describe('NumbasComponent', () => {
  let component: NumbasComponent;
  let fixture: ComponentFixture<NumbasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumbasComponent],
      providers: [ScormService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumbasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
