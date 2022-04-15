import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';

import { SplashScreenComponent } from './splash-screen.component';

describe('SplashScreenComponent', () => {
  let component: SplashScreenComponent;
  let fixture: ComponentFixture<SplashScreenComponent>;
  let globalStateServiceStub: Partial<GlobalStateService>;

  beforeEach(
    waitForAsync(() => {
      const isLoadingSubject = new BehaviorSubject<boolean>(true);

      globalStateServiceStub = {
        isLoadingSubject: isLoadingSubject,
      };

      TestBed.configureTestingModule({
        declarations: [SplashScreenComponent],
        imports: [BrowserAnimationsModule],
        providers: [{ provide: GlobalStateService, useValue: globalStateServiceStub }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SplashScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
