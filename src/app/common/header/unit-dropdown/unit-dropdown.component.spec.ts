import {DateService} from 'src/app/common/services/date.service';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {MatMenuModule} from '@angular/material/menu';
import {UnitDropdownComponent} from './unit-dropdown.component';

describe('UnitDropdownComponent', () => {
  let component: UnitDropdownComponent;
  let fixture: ComponentFixture<UnitDropdownComponent>;
  let dateServiceStub: jasmine.SpyObj<any>;

  beforeEach(waitForAsync(() => {
    dateServiceStub = jasmine.createSpy();
    dateServiceStub.showDate = true;

    TestBed.configureTestingModule({
      declarations: [UnitDropdownComponent],
      imports: [MatMenuModule],
      providers: [{provide: DateService, useValue: dateServiceStub}],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
