import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'f-grant-extension-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './grant-extension-form.component.html',
  styleUrls: ['./grant-extension-form.component.scss']
})
export class GrantExtensionFormComponent implements OnInit {
  grantExtensionForm!: FormGroup;
  // Tracks if the form is currently submitting
  isSubmitting = false;
  // Test list of students (to be replaced by API data)
  students = [
  { id: 1, name: 'Joe M' },
  { id: 2, name: 'Sahiru W' },
  { id: 3, name: 'Samindi M' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize the form and apply validators to required fields
    this.grantExtensionForm = this.fb.group({
      student: ['', Validators.required], // Student must be selected
      extension: [1, [Validators.required, Validators.min(1)]], // Minimum value of 1
      reason: ['', Validators.required], // Must provide reason
      notes: [''],
    });
  }

  onSubmit(): void {
    // If form is invalid. Validation errors are shown
    if (this.grantExtensionForm.invalid) {
      this.grantExtensionForm.markAllAsTouched(); // Triggers validation messages
      return;
    }

    this.isSubmitting = true; // Disables the button for loading state

    // Submission delay test
    setTimeout(() => {
      console.log('Form submitted:', this.grantExtensionForm.value);

      // Resets form values
      this.grantExtensionForm.reset({
        student: '',
        extension: 1,
        reason: '',
        notes: ''
      });
      // Reset the submit button
      this.isSubmitting = false;
    }, 1000); // Delay for submission
  }
}
