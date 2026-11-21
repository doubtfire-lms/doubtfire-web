import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaffGrantExtensionFormComponent } from './grant-extension-form.component';

describe('StaffGrantExtensionFormComponent', () => {
  let component: StaffGrantExtensionFormComponent;
  let fixture: ComponentFixture<StaffGrantExtensionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffGrantExtensionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffGrantExtensionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
