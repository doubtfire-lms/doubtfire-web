import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-grant-extension-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './grant-extension-form.component.html',
  styleUrls: ['./grant-extension-form.component.scss']
})
export class GrantExtensionFormComponent implements OnInit {
  grantExtensionForm!: FormGroup;
  students = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.grantExtensionForm = this.fb.group({
      student: ['', Validators.required],
      extension: [1, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required],
      notes: [''],
    });
  }

  onSubmit(): void {
    console.log('Clicked!');
    if (this.grantExtensionForm.valid) {
      console.log('Submitted', this.grantExtensionForm.value);
      // API goes here
    }
  }
}
