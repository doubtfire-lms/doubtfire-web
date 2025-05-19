import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExtensionService } from 'src/app/api/services/extension.service';

@Component({
  selector: 'f-grant-extension-form',
  standalone: true,
  imports: [
  ReactiveFormsModule,
  CommonModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatSliderModule,
  MatButtonModule,
  MatDialogModule
  ],
  templateUrl: './grant-extension-form.component.html',
})
export class GrantExtensionFormComponent implements OnInit {
  grantExtensionForm!: FormGroup;
  isSubmitting = false;
  // List of test students to be displayed in the dropdown
  students = [
    { id: 1, name: 'Joe M' },
    { id: 2, name: 'Sahiru W' },
    { id: 3, name: 'Samindi M' },
    { id: 4, name: 'Samantha W' },
    { id: 5, name: 'Samantha M' },
    { id: 6, name: 'Samantha S' },
    { id: 7, name: 'Samantha T' },
    { id: 8, name: 'Samantha U' },
    { id: 9, name: 'Samantha V' },
    { id: 10, name: 'Samantha W' },
    { id: 11, name: 'Samantha X' },
    { id: 12, name: 'Samantha Y' },
    { id: 13, name: 'Samantha Z' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GrantExtensionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { unitId: number; taskDefinitionId: number },
    private snackBar: MatSnackBar,
    private extensionService: ExtensionService
    ) {
      console.log('[GrantExtensionFormComponent] Constructor data:', data);
    }

  ngOnInit(): void {
    this.grantExtensionForm = this.fb.group({
      student_ids: [[], Validators.required],
      extension: [1, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required],
      notes: [''],
    });
  }

  submitForm(): void {
    if (this.grantExtensionForm.invalid) {
      this.grantExtensionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { student_ids, extension, reason, notes } = this.grantExtensionForm.value;

    const payload = {
      student_ids,
      task_definition_id: this.data.taskDefinitionId,
      weeks_requested: extension,
      comment: reason,
      notes
  };


    console.log('Sending request to grant extension:', payload);
    this.extensionService.grantExtension(this.data.unitId, payload).subscribe({
      next: () => {
        this.snackBar.open('Extension granted successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        const errorMsg = error?.error?.message || 'An unexpected error occurred. Please try again.';
        this.snackBar.open(`Failed to grant extension: ${errorMsg}`, 'Close', { duration: 5000 });
        console.error('Grant Extension Error:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
