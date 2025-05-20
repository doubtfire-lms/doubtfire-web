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
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatDialogModule,
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './grant-extension-form.component.html'
})
export class GrantExtensionFormComponent implements OnInit {
  grantExtensionForm!: FormGroup;
  isSubmitting = false;
  searchQuery = '';
  selectedStudents: number[] = [];
  showStudentList = false;

  // Temporary values will be replaced with dynamic context
  unitId = 1;
  taskDefinitionId = 25;

  // List of test students to choose from
  students = [
    { id: 1, name: 'Joe M' },
    { id: 2, name: 'Sahiru W' },
    { id: 3, name: 'Samindi M' },
    { id: 4, name: 'Student 4' },
    { id: 5, name: 'Student 5' },
    { id: 6, name: 'Student 6' },
    { id: 7, name: 'Student 7' },
    { id: 8, name: 'Student 8' },
    { id: 9, name: 'Student 9' },
    { id: 10, name: 'Student 10' },
    { id: 11, name: 'Student 11' },
    { id: 12, name: 'Student 12' },
    { id: 13, name: 'Student 13' },
    { id: 14, name: 'Student 14' },
    { id: 15, name: 'Student 15' },
    { id: 16, name: 'Student 16' },
    { id: 17, name: 'Student 17' },
    { id: 18, name: 'Student 18' },
    { id: 19, name: 'Student 19' },
    { id: 20, name: 'Student 20' }
  ];
  filteredStudents = this.students;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GrantExtensionFormComponent>,
    private snackBar: MatSnackBar,
    private extensionService: ExtensionService
  ) {}

  // Initialize the reactive form with validators for each field
  ngOnInit(): void {
    this.grantExtensionForm = this.fb.group({
      students: [[], Validators.required],
      extension: [1, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required],
      notes: ['']
    });
  }

  // Filters students based on search query
  filterStudents(): void {
    if (!this.searchQuery) {
      this.filteredStudents = this.students;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredStudents = this.students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.id.toString().includes(query)
      );
    }
  }

  // Toggles student selection state
  toggleStudent(studentId: number): void {
    const index = this.selectedStudents.indexOf(studentId);
    if (index === -1) {
      this.selectedStudents.push(studentId);
    } else {
      this.selectedStudents.splice(index, 1);
    }
    this.grantExtensionForm.patchValue({ students: this.selectedStudents });
  }

  // Handles keyboard navigation for student selection
  handleStudentKeydown(event: KeyboardEvent, studentId: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleStudent(studentId);
    }
  }

  // Toggles selection of all filtered students
  toggleSelectAll(): void {
    if (this.selectedStudents.length === this.filteredStudents.length) {
      this.selectedStudents = [];
    } else {
      this.selectedStudents = this.filteredStudents.map(student => student.id);
    }
    this.grantExtensionForm.patchValue({ students: this.selectedStudents });
  }

  // Checks if a student is selected
  isStudentSelected(studentId: number): boolean {
    return this.selectedStudents.includes(studentId);
  }

  // Safely handles blur for checkboxes
  handleCheckboxBlur(): void {
    // This avoids calling blur() directly on the checkbox reference
    // which can cause errors when the reference isn't to a DOM element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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

    const { students, extension, reason, notes } = this.grantExtensionForm.value;
    const unitId = 1; // temporary value
    const payload = {
      student_ids: students,
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
