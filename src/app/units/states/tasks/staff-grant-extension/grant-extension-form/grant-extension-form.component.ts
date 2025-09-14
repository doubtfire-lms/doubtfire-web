import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExtensionService } from 'src/app/api/services/extension.service';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from 'src/app/api/models/doubtfire-model';
import { finalize } from 'rxjs/operators';
import { ExtensionServiceResult, ExtensionSummaryPayload } from 'src/app/units/states/tasks/staff-grant-extension/models/extension-results.model';

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
    MatCheckboxModule
  ],
  templateUrl: './grant-extension-form.component.html'
})
export class StaffGrantExtensionFormComponent implements OnInit {
  @Output() extensionResult = new EventEmitter<ExtensionSummaryPayload>();

  grantExtensionForm!: FormGroup;
  isSubmitting = false;
  searchQuery = '';
  selectedStudents: number[] = [];
  showStudentList = true;

  // Old hardcoded values (for reference):
  // unitId = 1;
  // taskDefinitionId = 25;
  // students = [
  //   { id: 1, name: 'Joe M' },
  //   { id: 2, name: 'Sahiru W' },
  //   { id: 3, name: 'Samindi M' },
  //   { id: 4, name: 'Student 4' },
  //   { id: 5, name: 'Student 5' },
  //   { id: 6, name: 'Student 6' },
  //   { id: 7, name: 'Student 7' },
  //   { id: 8, name: 'Student 8' },
  //   { id: 9, name: 'Student 9' },
  //   { id: 10, name: 'Student 10' },
  //   { id: 11, name: 'Student 11' },
  //   { id: 12, name: 'Student 12' },
  //   { id: 13, name: 'Student 13' },
  //   { id: 14, name: 'Student 14' },
  //   { id: 15, name: 'Student 15' },
  //   { id: 16, name: 'Student 16' },
  //   { id: 17, name: 'Student 17' },
  //   { id: 18, name: 'Student 18' },
  //   { id: 19, name: 'Student 19' },
  //   { id: 20, name: 'Student 20' }
  // ];

  @Input() unitId!: number;
  @Input() taskDefinitionId!: number;
  @Input() students: { id: number; name: string }[] = [];
  filteredStudents: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private extensionService: ExtensionService,
    private http: HttpClient,
    private userService: UserService
  ) { }

  // Build headers for API calls
  private buildHeaders(): HttpHeaders {
    const authToken = this.userService.currentUser?.authenticationToken ?? '';
    const username = this.userService.currentUser?.username ?? '';
    return new HttpHeaders({
      'Auth-Token': authToken,
      'Username': username
    });
  }

  // Load students for the unit
  private loadUnitStudents(): void {
    if (!this.unitId) return;

    this.http.get<{ student: { id: number; first_name: string; last_name: string } }[]>(
      `/api/students?unit_id=${this.unitId}`,
      { headers: this.buildHeaders() }
    ).subscribe({
      next: (projects) => {
        this.students = (projects ?? []).map(p => ({
          id: p.student.id,
          name: `${p.student.first_name} ${p.student.last_name}`
        }));
        this.filteredStudents = this.students;
      },
      error: () => {
        this.students = [];
        this.filteredStudents = [];
      }
    });
  }

  // Initialize the reactive form with validators for each field
  ngOnInit(): void {
    this.grantExtensionForm = this.fb.group({
      students: [[], Validators.required],
      extension: [1, [Validators.required, Validators.min(1)]],
      reason: ['', [Validators.required, Validators.maxLength(300)]]
    });

    this.filteredStudents = this.students;

    if (!this.students?.length) {
      this.loadUnitStudents();
    }
  }

  // Filters students based on search query
  filterStudents(): void {
    if (!this.searchQuery.trim()) {
      this.filteredStudents = this.students;
    } else {
      this.filteredStudents = this.students.filter(student =>
        student.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        student.id.toString().includes(this.searchQuery)
      );
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

  // Toggle select all students
  toggleSelectAll(): void {
    if (this.selectedStudents.length === this.filteredStudents.length) {
      this.selectedStudents = [];
    } else {
      this.selectedStudents = this.filteredStudents.map(student => student.id);
    }
    this.updateFormStudents();
  }

  // Update form control with selected students
  updateFormStudents(): void {
    this.grantExtensionForm.patchValue({
      students: this.selectedStudents
    });
  }

  // Handle keyboard navigation for student list
  handleStudentKeydown(event: KeyboardEvent, studentId: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleStudent(studentId);
    }
  }

  // Handle checkbox blur to prevent immediate closing
  handleCheckboxBlur(): void {
    setTimeout(() => {
      this.showStudentList = true;
    }, 100);
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
        comment: formData.reason
      };

      // Submit the extension request
      this.extensionService.grantExtension(this.unitId, payload)
        .pipe(
          finalize(() => { this.isSubmitting = false; }) // added this: always unset submitting flag
        )
        .subscribe({
          next: (results: ExtensionServiceResult) => {
            this.snackBar.open('Extensions granted successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });

            // Build summary payload including weeksRequested and createdAt timestamp
            const summaryPayload: ExtensionSummaryPayload = {
              results: results,
              weeksRequested: payload.weeks_requested,
              createdAt: new Date().toISOString(),
              taskDefinitionId: this.taskDefinitionId!
            };

            // Emit the detailed summary so parent can show it
            this.extensionResult.emit(summaryPayload);

            // Reset form
            this.resetForm();

        },
        error: (error) => {
          console.error('Error granting extensions:', error);

          const errorResults = error?.error?.results;
          if (errorResults) {
            const summaryPayload: ExtensionSummaryPayload = {
              results: errorResults,
              weeksRequested: payload.weeks_requested,
              createdAt: new Date().toISOString(),
              taskDefinitionId: this.taskDefinitionId!
            };
            this.extensionResult.emit(summaryPayload);
          }

          this.snackBar.open('Error granting extensions. Please try again.', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      // Show validation error message
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  // Mark all form controls as touched to trigger validation display
  private markFormGroupTouched(): void {
    Object.keys(this.grantExtensionForm.controls).forEach(key => {
      const control = this.grantExtensionForm.get(key);
      control?.markAsTouched();
    });
  }

  // Reset the form
  resetForm(): void {
    this.grantExtensionForm.reset({
      students: [],
      extension: 1,
      reason: ''
    });
    this.selectedStudents = [];
    this.searchQuery = '';
    this.filteredStudents = this.students;
    this.showStudentList = true;
  }
}
