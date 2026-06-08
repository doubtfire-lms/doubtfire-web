import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SidekiqProgressModalComponent} from './sidekiq-progress-modal.component';

describe('SidekiqProgressModalComponent', () => {
  let component: SidekiqProgressModalComponent;
  let fixture: ComponentFixture<SidekiqProgressModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidekiqProgressModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidekiqProgressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
