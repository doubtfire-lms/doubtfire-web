import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {of} from 'rxjs';
import {ProjectService, Unit, UnitService} from 'src/app/api/models/doubtfire-model';
import {StaffGrantExtensionFormComponent} from './grant-extension-form.component';

describe('StaffGrantExtensionFormComponent', () => {
  let component: StaffGrantExtensionFormComponent;
  let fixture: ComponentFixture<StaffGrantExtensionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffGrantExtensionFormComponent],
      providers: [
        {provide: UnitService, useValue: {}},
        {provide: ProjectService, useValue: {loadStudents: () => of([])}},
        {provide: MatSnackBar, useValue: {}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffGrantExtensionFormComponent);
    component = fixture.componentInstance;
    component.unit = Object.assign(new Unit(), {id: 1});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
