import { Component, Input, OnInit, Inject } from '@angular/core';
import { outcomeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-ilo-alignment-rater',
  templateUrl: 'task-ilo-alignment-rater.component.html',
  styleUrls: ['task-ilo-alignment-rater.component.scss'],
}) 
export class TaskIloAlignmentRaterComponent implements OnInit {
  @Input() readonly: boolean = true;
  // Alignment object
  @Input() alignment: any;
  // Unit object
  @Input() unit: any;
  // Function to call when rating is changed
  @Input() onRatingChanged: any;
  @Input() showLabels: boolean = false;
  @Input() compact: boolean = false;
  // Maximum rate
  max: number = 5;
  labels: string;
  hoveringOver: number = 0;
  // For watching
  oldAlignmentRating: number;

  constructor(@Inject(outcomeService) private outcomeService:any) { }

  ngOnInit() {
    // Retrieve tooltip text
    this.labels = this.outcomeService.alignmentLabels;
    this.oldAlignmentRating = this.alignment.rating;
    
  }

  setHoverValue(value) {
    if(this.readonly) return this.alignment;
    this.hoveringOver = value;
  }

  ngDoCheck() {
    if(this.onRatingChanged == null || this.alignment == null) return;
    if(this.alignment.rating != this.oldAlignmentRating){
      this.onRatingChanged(this.alignment);
      this.oldAlignmentRating=this.alignment.rating;
    }
  }
}
