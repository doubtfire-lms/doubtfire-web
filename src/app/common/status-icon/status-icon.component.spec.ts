import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { taskService } from 'src/app/ajs-upgraded-providers';

import { StatusIconComponent } from './status-icon.component';

describe('StatusIconComponent', () => {
  let component: StatusIconComponent;
  let fixture: ComponentFixture<StatusIconComponent>;
  let taskServiceStub: jasmine.SpyObj<any>;

  beforeEach(
    waitForAsync(() => {
      taskServiceStub = {
        statusIcons: {},
        statusLabels: {},
        statusClass: () => {},
      };

      TestBed.configureTestingModule({
        declarations: [StatusIconComponent],
        providers: [{ provide: taskService, useValue: taskServiceStub }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
