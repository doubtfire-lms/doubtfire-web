import { Component, Input, Inject, OnInit } from '@angular/core';
import { taskService } from 'src/app/ajs-upgraded-providers';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'progress-modal',
  templateUrl: './progress-modal.component.html',
  styleUrls: ['./progress-modal.component.scss'],
})
export class ProgressModalComponent implements OnInit {
  @Input() title: any;
  @Input() message: any;

  constructor(
    public dialogRef: MatDialogRef<ProgressModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(taskService) private bop: any
  ) {}

  ngOnInit() {
    this.title = this.bop;
    this.message = this.data;
    console.log(this.title);
    console.log(this.data);
  }
}
