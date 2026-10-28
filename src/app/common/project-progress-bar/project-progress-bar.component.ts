import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'f-project-progress-bar',
  templateUrl: './project-progress-bar.component.html',
  styleUrls: ['./project-progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectProgressBarComponent implements OnChanges {
  @Input() progress: {value: number}[];
  public percentProgress: number = 0;

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
