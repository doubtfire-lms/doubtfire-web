import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {ExtensionSummaryPayload} from '../models/extension-results.model';
import {StaffGrantExtensionSummaryComponent} from './staff-grant-extension-summary.component';

describe('StaffGrantExtensionSummaryComponent', () => {
  let component: StaffGrantExtensionSummaryComponent;
  let fixture: ComponentFixture<StaffGrantExtensionSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffGrantExtensionSummaryComponent],
      imports: [MatButtonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffGrantExtensionSummaryComponent);
    component = fixture.componentInstance;
    component.summary = {
      results: {
        successful: [
          {
            student_id: 1,
            project_id: 1,
            weeks_requested: 1,
            extension_response: 'Granted',
            task_status: 'Complete',
          },
        ],
        failed: [],
        skipped: [],
      },
      weeksRequested: 1,
      createdAt: new Date().toISOString(),
      taskDefinitionId: 1,
    } satisfies ExtensionSummaryPayload;
    fixture.detectChanges();
  });

  it('shows the number of successful extensions', () => {
    expect(component.successCount).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('1 student');
  });

  it('emits when dismissed', () => {
    const dismissed = vi.fn();
    component.dismissed.subscribe(dismissed);

    component.dismiss();

    expect(dismissed).toHaveBeenCalledOnce();
  });
});
