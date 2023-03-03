import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { dateService } from 'src/app/ajs-upgraded-providers';

import { UnitDropdownComponent } from './unit-dropdown.component';

describe('UnitDropdownComponent', () => {
  let component: UnitDropdownComponent;
  let fixture: ComponentFixture<UnitDropdownComponent>;
  let dateServiceStub: jasmine.SpyObj<any>;

  beforeEach(
    waitForAsync(() => {
      dateServiceStub = jasmine.createSpy();
      dateServiceStub.showDate = true;

      TestBed.configureTestingModule({
        declarations: [UnitDropdownComponent],
        imports: [MatMenuModule],
        providers: [{ provide: dateService, useValue: dateServiceStub }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
