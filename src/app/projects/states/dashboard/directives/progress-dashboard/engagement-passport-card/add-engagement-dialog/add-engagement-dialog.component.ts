import {Html5QrcodeScanner, Html5QrcodeScannerState} from 'html5-qrcode';
import {ChangeDetectionStrategy, Component, Inject, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {
  Engagement,
  EngagementService,
  Project,
  ProjectService,
} from 'src/app/api/models/doubtfire-model';
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
export class AddEngagementDialogComponent implements OnDestroy {
  readonly engagementTypes = ['Discuss', 'Attendance', 'Forum', 'Email', 'Opportunity'];
  readonly notePlaceholders: Record<string, string> = {
    attendance: 'Attended tutorial and participated in class activities.',
    discuss: 'Discussed tasks during tutorial.',
    discussion: 'Discussed tasks during tutorial.',
    forum: 'Posted to the unit forum and engaged with discussion.',
    email: 'Discussed unit progress with the teaching team via email.',
    opportunity: 'Engagement concern noted for follow-up.',
  };
  readonly maxAttachmentSize = 30 * 1024 * 1024;
  readonly form: FormGroup<AddEngagementForm>;

  attachment?: File;
  attachmentError?: string;
  saving = false;
  groupMode = false;
  groupProjects: Project[];
  scanningStudent = false;
  loadingStudent = false;

  private qrScanner?: Html5QrcodeScanner;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: {project: Project},
    private dialogRef: MatDialogRef<AddEngagementDialogComponent>,
    private engagementService: EngagementService,
    private projectService: ProjectService,
    private alerts: AlertService,
  ) {
    this.groupProjects = [data.project];
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

  get projects(): Project[] {
    return this.groupMode ? this.groupProjects : [this.data.project];
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

  modeChanged(index: number): void {
    this.groupMode = index === 1;
  }

  addStudent(): void {
    this.scanningStudent = true;
    setTimeout(() => {
      this.qrScanner = new Html5QrcodeScanner(
        'engagement-group-qr-reader',
        {fps: 10, qrbox: 250},
        false,
      );
      this.qrScanner.render(
        (data) => this.studentQrScanned(data),
        () => {
          // Invalid frames are expected while the camera is searching for a QR code.
        },
      );
    });
  }

  cancelStudentScan(): void {
    this.closeStudentScanner();
  }

  removeStudent(project: Project): void {
    if (project.id !== this.data.project.id) {
      this.groupProjects = this.groupProjects.filter((member) => member.id !== project.id);
    }
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
        projectIds: this.projects.map((project) => project.id),
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

  ngOnDestroy(): void {
    this.qrScanner?.clear().catch(() => undefined);
  }

  private studentQrScanned(data: string): void {
    if (this.loadingStudent) {
      return;
    }

    let unitId: number;
    let projectId: number;
    let username: string | null;
    try {
      const params = new URL(data).searchParams;
      unitId = Number(params.get('unitId'));
      projectId = Number(params.get('projectId'));
      username = params.get('username');
    } catch {
      return;
    }

    if ((!unitId && projectId <= 0 && !username) || !this.qrScanner) {
      return;
    }

    this.qrScanner.pause(true);
    this.loadingStudent = true;

    if (unitId && unitId !== this.data.project.unit.id) {
      this.loadingStudent = false;
      this.alerts.error('This student is not enrolled in the current unit.');
      this.resumeStudentScanner();
      return;
    }

    this.projectService.loadStudents(this.data.project.unit, false, false).subscribe({
      next: (projects) => {
        const project = projects.find(
          (candidate) =>
            (projectId > 0 && candidate.id === projectId) ||
            (username && candidate.student.username === username),
        );

        if (!project) {
          this.loadingStudent = false;
          this.alerts.error('This student is not enrolled in the current unit.');
          this.resumeStudentScanner();
          return;
        }

        if (!this.groupProjects.some((member) => member.id === project.id)) {
          this.groupProjects = [...this.groupProjects, project];
          this.alerts.success(`${project.student.name} added to the group.`);
        } else {
          this.alerts.message(`${project.student.name} is already in the group.`);
        }
        this.closeStudentScanner();
      },
      error: (error) => {
        this.loadingStudent = false;
        this.alerts.error(error?.error ?? 'Unable to load this student.');
        this.resumeStudentScanner();
      },
    });
  }

  private resumeStudentScanner(): void {
    setTimeout(() => {
      if (this.qrScanner?.getState() === Html5QrcodeScannerState.PAUSED) {
        this.qrScanner.resume();
      }
    }, 1000);
  }

  private closeStudentScanner(): void {
    const scanner = this.qrScanner;
    this.qrScanner = undefined;
    Promise.resolve(scanner?.clear())
      .catch(() => undefined)
      .finally(() => {
        this.scanningStudent = false;
        this.loadingStudent = false;
      });
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
