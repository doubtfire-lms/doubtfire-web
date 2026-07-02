import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Engagement, EngagementService, Project} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';

type EvidenceMode = 'none' | 'url' | 'attachment';

interface AddEngagementForm {
  engagementType: FormControl<string>;
  note: FormControl<string>;
  occurredDate: FormControl<Date>;
  occurredTime: FormControl<string>;
  evidenceMode: FormControl<EvidenceMode>;
  evidenceUrl: FormControl<string>;
}

@Component({
  selector: 'f-add-engagement-dialog',
  templateUrl: './add-engagement-dialog.component.html',
  styleUrl: './add-engagement-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AddEngagementDialogComponent {
  readonly engagementTypes = ['Discuss', 'Attendance', 'Forum', 'Email', 'Attention'];
  readonly notePlaceholders: Record<string, string> = {
    attendance: 'Attended tutorial and participated in class activities.',
    discuss: 'Discussed tasks during tutorial.',
    discussion: 'Discussed tasks during tutorial.',
    forum: 'Posted to the unit forum and engaged with discussion.',
    email: 'Discussed unit progress with the teaching team via email.',
    attention: 'Engagement concern noted for follow-up.',
  };
  readonly maxAttachmentSize = 30 * 1024 * 1024;
  readonly form: FormGroup<AddEngagementForm>;

  attachment?: File;
  attachmentError?: string;
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: {project: Project},
    private dialogRef: MatDialogRef<AddEngagementDialogComponent>,
    private engagementService: EngagementService,
    private alerts: AlertService,
  ) {
    const now = new Date();
    this.form = new FormGroup<AddEngagementForm>({
      engagementType: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      note: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(4095)],
      }),
      occurredDate: new FormControl(now, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      occurredTime: new FormControl(this.formatTime(now), {
        nonNullable: true,
        validators: [Validators.required],
      }),
      evidenceMode: new FormControl<EvidenceMode>('none', {nonNullable: true}),
      evidenceUrl: new FormControl('', {
        nonNullable: true,
        validators: [Validators.pattern(/^https?:\/\/.+/i)],
      }),
    });
  }

  get canSubmit(): boolean {
    if (this.form.invalid || this.saving || this.attachmentError !== undefined) {
      return false;
    }

    const mode = this.form.controls.evidenceMode.value;
    if (mode === 'url') {
      return this.form.controls.evidenceUrl.value.trim().length > 0;
    }
    if (mode === 'attachment') {
      return this.attachment !== undefined;
    }

    return true;
  }

  get notePlaceholder(): string {
    const engagementType = this.form.controls.engagementType.value.trim().toLowerCase();
    return (
      this.notePlaceholders[engagementType] ?? 'Describe how the student engaged with the unit.'
    );
  }

  engagementTypeSelected(input: HTMLInputElement): void {
    window.setTimeout(() => input.blur());
  }

  evidenceModeChanged(): void {
    const mode = this.form.controls.evidenceMode.value;

    if (mode !== 'url') {
      this.form.controls.evidenceUrl.setValue('');
    }
    this.attachment = undefined;
    this.attachmentError = undefined;
  }

  fileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.attachment = undefined;
    this.attachmentError = undefined;

    if (!file) {
      return;
    }
    if (file.size === 0) {
      this.attachmentError = 'The selected file is empty.';
      input.value = '';
      return;
    }
    if (file.size > this.maxAttachmentSize) {
      this.attachmentError = 'The selected file must be no larger than 30 MB.';
      input.value = '';
      return;
    }
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      this.attachmentError = 'Select an image or PDF file.';
      input.value = '';
      return;
    }

    this.attachment = file;
  }

  submit(): void {
    if (!this.canSubmit) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const occurredAt = new Date(values.occurredDate);
    const [hours, minutes] = values.occurredTime.split(':').map(Number);
    occurredAt.setHours(hours, minutes, 0, 0);

    this.saving = true;
    this.engagementService
      .createEngagement(this.data.project, {
        engagementType: values.engagementType.trim(),
        note: values.note.trim() || this.notePlaceholder,
        occurredAt,
        evidenceUrl: values.evidenceMode === 'url' ? values.evidenceUrl.trim() : undefined,
        attachment: values.evidenceMode === 'attachment' ? this.attachment : undefined,
      })
      .subscribe({
        next: (engagement: Engagement) => {
          this.alerts.success('Engagement stamp added.');
          this.dialogRef.close(engagement);
        },
        error: (error) => {
          this.saving = false;
          this.alerts.error(error?.error ?? 'Unable to add the engagement stamp.');
        },
      });
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
