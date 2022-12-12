import { Directive, Component, ElementRef, Input } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';


@Directive({
  selector: '[/*managerHighlight]'
})

@Component({
  selector: 'tutorGroupManager',
  templateUrl: 'groups/tutor-group-manager/tutor-group-manager.tpl.html'

})

/*@View({
    templateUrl: 'groups/tutor-group-manager/tutor-group-manager.tpl.html'
})*/

export class tutorgroupManager {
  
  tutorGroupManager: any;
  constructor(private el: ElementRef) {  }
  /*@Input() defaultColor = '';*/
  @Input() default = '';
  
  ngonInit() {
    if(this.tutorGroupManager){
      this.tutorGroupManager
      = true
    }
  }
}
