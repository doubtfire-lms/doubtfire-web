import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NumbasExamComponent } from './numbas-exam.component';

describe('NumbasExamComponent', () => {
  let component: NumbasExamComponent;
  let fixture: ComponentFixture<NumbasExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumbasExamComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumbasExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Add more tests here
});
