import { TestBed } from '@angular/core/testing';
import { ProgressModalComponent } from './progress-modal.component';

describe('ProgressModalComponent', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ProgressModalComponent],
    }).compileComponents();
  });

  it('should create the modal', () => {
    const modal = TestBed.createComponent(ProgressModalComponent);
    const app = modal.debugElement.componentInstance;
    expect(app.toBeTruthy());
  });

  it('should render `title`', () => {
    const fixture = TestBed.createComponent(ProgressModalComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('title-definition').textContent).toBeTruthy;
  });

  it('should render `message`', () => {
    const fixture = TestBed.createComponent(ProgressModalComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('message-definition').textContent).toBeTruthy();
  });
});
