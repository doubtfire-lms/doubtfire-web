import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrantExtensionFormComponent } from './grant-extension-form.component';

describe('GrantExtensionFormComponent', () => {
  let component: GrantExtensionFormComponent;
  let fixture: ComponentFixture<GrantExtensionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrantExtensionFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GrantExtensionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
