import { Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'task-ilo-alignment-star',
  templateUrl: 'task-ilo-alignment-star.component.html',
  styleUrls: ['task-ilo-alignment-star.component.scss'],
})
export class TaskIloAlignmentStarComponent implements OnChanges{
    @Input() alignment: any;

    public max = 5;
    public starList = [];
    

    ngOnChanges(changes: SimpleChanges): void {
      for(let i = 0; i < changes.alignment.currentValue.rating; i++){
        this.starList.push(true);
      }

      for(let i = 0; i < this.max - changes.alignment.currentValue.rating; i++){
        this.starList.push(false);
      }
    }
}
