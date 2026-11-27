import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatSnackBar} from '@angular/material/snack-bar';
import {finalize} from 'rxjs/operators';
import {Project, ProjectService, Unit, UnitService} from 'src/app/api/models/doubtfire-model';
import {
  ExtensionServiceResult,
  ExtensionSummaryPayload,
} from 'src/app/units/states/tasks/staff-grant-extension/models/extension-results.model';

@Component({
  selector: 'f-staff-grant-extension-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSliderModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './grant-extension-form.component.html',
})
export class StaffGrantExtensionFormComponent implements OnInit {
  @Output() extensionResult: EventEmitter<ExtensionSummaryPayload> = new EventEmitter();

  grantExtensionForm!: FormGroup;
  isSubmitting = false;
  searchQuery = '';
  selectedStudents: number[] = [];

  @Input({required: true}) unit!: Unit;
  @Input() taskDefinitionId!: number;
  @Input() students: Project[] = [];
  filteredStudents: Project[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private unitService: UnitService,
    private projectService: ProjectService,
  ) {}

  // Load students for the unit
  private loadUnitStudents(): void {
    if (!this.unit) {
      return;
    }

    this.projectService.loadStudents(this.unit).subscribe({
      next: (projects) => {
        this.students = projects ?? [];
        this.filteredStudents = this.students;
      },
      error: () => {
        this.students = [];
        this.filteredStudents = [];
      },
    });
  }

  // Initialize the reactive form with validators for each field
  ngOnInit(): void {
    this.grantExtensionForm = this.fb.group({
      students: [[], Validators.required],
      extension: [1, [Validators.required, Validators.min(1)]],
      reason: ['', [Validators.required, Validators.maxLength(300)]],
    });

    this.filteredStudents = this.students;

    if (!this.students?.length) {
      this.loadUnitStudents();
    }
  }

  // Filters students based on search query
  filterStudents(): void {
    const searchQuery = this.searchQuery.trim();
    if (!searchQuery) {
      this.filteredStudents = this.students;
    } else {
      this.filteredStudents = this.students.filter((student) => student.matches(searchQuery));
    }
  }

  // Toggle student selection
  toggleStudent(studentId: number): void {
    const index = this.selectedStudents.indexOf(studentId);
    if (index > -1) {
      this.selectedStudents.splice(index, 1);
    } else {
      this.selectedStudents.push(studentId);
    }
    this.updateFormStudents();
  }

  // Check if student is selected
  isStudentSelected(studentId: number): boolean {
    return this.selectedStudents.includes(studentId);
  }

  get allFilteredSelected(): boolean {
    return (
      this.filteredStudents.length > 0 &&
      this.filteredStudents.every((student) => this.isStudentSelected(student.id))
    );
  }

  // Toggle select all students
  toggleSelectAll(): void {
    const filteredIds = this.filteredStudents.map((student) => student.id);
    if (this.allFilteredSelected) {
      this.selectedStudents = this.selectedStudents.filter((id) => !filteredIds.includes(id));
    } else {
      this.selectedStudents = [...new Set([...this.selectedStudents, ...filteredIds])];
    }
    this.updateFormStudents();
  }

  // Update form control with selected students
  updateFormStudents(): void {
    this.grantExtensionForm.patchValue({
      students: this.selectedStudents,
    });
  }

  // Submit the form
  submitForm(): void {
    // Mark all form controls as touched to trigger validation display
    this.markFormGroupTouched();

    if (this.grantExtensionForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formData = this.grantExtensionForm.value;

      // Create the payload for the extension service
      const payload = {
        student_ids: this.selectedStudents,
        task_definition_id: this.taskDefinitionId,
        weeks_requested: formData.extension,
        comment: formData.reason,
      };

      // Submit the extension request
      this.unitService
        .grantExtension(this.unit, payload)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          }), // added this: always unset submitting flag
        )
        .subscribe({
          next: (results: ExtensionServiceResult) => {
            this.snackBar.open('Extensions granted successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });

            // Build summary payload including weeksRequested and createdAt timestamp
            const summaryPayload: ExtensionSummaryPayload = {
              results: results,
              weeksRequested: payload.weeks_requested,
              createdAt: new Date().toISOString(),
              taskDefinitionId: this.taskDefinitionId!,
            };

            // Emit the detailed summary so parent can show it
            this.extensionResult.emit(summaryPayload);

            // Reset form
            this.resetForm();
          },
          error: (error) => {
            console.error('Error granting extensions:', error);

            // Extract specific error message from the API response
            let errorMessage = 'Error granting extensions. Please try again.';

            // Check if error is directly a string (most common case)
            if (typeof error === 'string') {
              errorMessage = error;
            } else if (error?.error) {
              // Check if error.error is a string
              if (typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error.error) {
                errorMessage = error.error.error;
              } else if (error.error.message) {
                errorMessage = error.error.message;
              }
            } else if (error?.message) {
              errorMessage = error.message;
            }

            const errorResults = error?.error?.results;
            if (errorResults) {
              const summaryPayload: ExtensionSummaryPayload = {
                results: errorResults,
                weeksRequested: payload.weeks_requested,
                createdAt: new Date().toISOString(),
                taskDefinitionId: this.taskDefinitionId!,
              };
              this.extensionResult.emit(summaryPayload);
            }

            this.snackBar.open(errorMessage, 'Close', {
              duration: 7000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
          },
        });
    } else {
      // Show validation error message
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    }
  }

  // Mark all form controls as touched to trigger validation display
  private markFormGroupTouched(): void {
    Object.keys(this.grantExtensionForm.controls).forEach((key) => {
      const control = this.grantExtensionForm.get(key);
      control?.markAsTouched();
    });
  }

  // Reset the form
  resetForm(): void {
    this.grantExtensionForm.reset({
      students: [],
      extension: 1,
      reason: '',
    });
    this.selectedStudents = [];
    this.searchQuery = '';
    this.filteredStudents = this.students;
  }
}
