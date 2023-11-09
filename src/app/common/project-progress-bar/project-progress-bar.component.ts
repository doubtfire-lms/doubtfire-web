import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Project } from 'src/app/api/models/project';

@Component({
  selector: 'f-project-progress-bar',
  templateUrl: './project-progress-bar.component.html',
  styleUrls: ['./project-progress-bar.component.scss'],
})
export class ProjectProgressBarComponent {
  @Input() progress: any[];
  public percentProgress: number = 0;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.progress) {
      if (changes.progress.currentValue) {
        this.percentProgress = this.progress[4]?.value;
      } else {
        this.percentProgress = 0;
      }
    }
  }
}
