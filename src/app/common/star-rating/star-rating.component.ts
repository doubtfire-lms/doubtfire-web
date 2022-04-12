import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit {
  @Input() totalStars: number;
  @Input() selectedRating: number;
  @Output() newSelectedRating = new EventEmitter<number>();

  stars = [];

  constructor() {}

  ngOnInit(): void {
    for (let i = 0; i < this.totalStars; i++) {
      const starClass = 'star star-hover ' + (i < this.selectedRating ? 'star-gold' : 'star-silver');
      this.stars.push({
        id: i + 1,
        icon: 'star',
        class: starClass
      });
    }
  }

  selectStar(value: number): void{
    this.stars.filter(star => {
      if (star.id <= value){
        star.class = 'star-gold star-hover star';
      }
      else {
        star.class = 'star-gray star-hover star';
      }
      return star;
    });
    this.selectedRating = value;
    this.newSelectedRating.emit(value);
  }

}
