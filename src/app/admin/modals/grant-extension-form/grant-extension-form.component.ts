import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  templateUrl: './grant-extension-form.component.html'
})
export class GrantExtensionFormComponent implements OnInit {
  grantExtensionForm!: FormGroup;
  isSubmitting = false;

  // Temporary values will be replaced with dynamic context
  unitId = 1;
  taskDefinitionId = 25;

  // List of test students to choose from
  students = [
    { id: 1, name: 'Joe M' },
    { id: 2, name: 'Sahiru W' },
    { id: 3, name: 'Samindi M' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GrantExtensionFormComponent>,
    private snackBar: MatSnackBar,
    private extensionService: ExtensionService
  ) {}

  // Initialize the reactive form with validators for each field
  ngOnInit(): void {
    this.grantExtensionForm = this.fb.group({
      student: ['', Validators.required],
      extension: [1, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required],
      notes: ['']
    });
  }

  // Handles form submission.
  // Builds the payload and sends it to the backend via the ExtensionService.
  // Displays a success or error message and closes the dialog on success.
  submitForm(): void {
    if (this.grantExtensionForm.invalid) {
      this.grantExtensionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { student, extension, reason, notes } = this.grantExtensionForm.value;
    const unitId = 1; // temporary value
    const payload = {
      student_ids: [student],
      task_definition_id: 25,
      weeks_requested: extension,
      comment: reason,
      notes: notes,
    };

    this.extensionService.grantExtension(unitId, payload).subscribe({
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

  // Closes the dialog without submitting the form
  close(): void {
    this.dialogRef.close();
  }
}
