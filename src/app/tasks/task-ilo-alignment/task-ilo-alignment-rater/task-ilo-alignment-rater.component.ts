import { Component, Input, OnInit, Inject } from '@angular/core';
import { outcomeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-ilo-alignment-rater',
  templateUrl: 'task-ilo-alignment-rater.component.html',
  styleUrls: ['task-ilo-alignment-rater.component.scss'],
}) 
export class TaskIloAlignmentRaterComponent implements OnInit {
  @Input() readonly: boolean = true;
  @Input() alignment: any;
  @Input() unit: any;
  @Input() onRatingChanged: any;
  @Input() showLabels: boolean = false;
  @Input() compact: boolean = false;

  max: number = 5;
  labels: string;

  constructor(@Inject(outcomeService) private outcomeService:any) { }

  ngOnInit() {
    // Retrieve tooltip text
    this.labels = this.outcomeService.alignmentLabels;
    // Create an empty object for rating component
    if(this.alignment == undefined) {
      this.alignment = { rating: 0 }
    }
  }

  changeValue($event) {
    // Submission Modal
    if(this.onRatingChanged == null) {
      this.alignment.rating = $event.source.value;
      return
    }
    // Admin
    if($event.value == 0){
      $event.source.value = this.alignment.rating;
      return;
    }
    this.alignment.rating = $event.value;
    this.onRatingChanged(this.alignment);
  }

  formatLabel(value: number) {
    return value;
  }

  ngDoCheck() {
    // Preventing the component from crashing after alignment be deleted
    if(this.compact) {
      if(this.alignment == undefined) this.alignment = { rating: 0 }
    }
  }
}
