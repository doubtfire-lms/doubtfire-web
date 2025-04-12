import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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
  styleUrls: ['./grant-extension-form.component.scss']
})
export class GrantExtensionFormComponent implements OnInit {
  grantExtensionForm!: FormGroup;
  isSubmitting = false;

  students = [
    { id: 1, name: 'Joe M' },
    { id: 2, name: 'Sahiru W' },
    { id: 3, name: 'Samindi M' }
  ];

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<GrantExtensionFormComponent>) {}

  ngOnInit(): void {
    this.grantExtensionForm = this.fb.group({
      student: ['', Validators.required],
      extension: [1, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required],
      notes: [''],
    });
  }

  onSubmit(): void {
    if (this.grantExtensionForm.invalid) {
      this.grantExtensionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      console.log('Form submitted:', this.grantExtensionForm.value);

      this.grantExtensionForm.reset({
        student: '',
        extension: 1,
        reason: '',
        notes: ''
      });

      this.isSubmitting = false;
      this.dialogRef.close();
    }, 1000);
  }
  close(): void {
    this.dialogRef.close();
  }
}
