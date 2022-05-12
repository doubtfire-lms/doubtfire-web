import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";


@Component({
  selector:'teaching-period-breaks',
  templateUrl:'teaching-period-breaks.component.html'
})
export default class TeachingPeriodBreaks implements OnInit, OnChanges{
@Input() teachingperiod:any;
sortOrder:string='start_date';
reverse:boolean=false;
modal:any;
constructor( @Inject('CreateBreakModal') CreateBreakModal: any
){
this.modal=CreateBreakModal;
}
  ngOnChanges(changes: SimpleChanges): void {
   console.log(changes);
  }
  ngOnInit(): void {

  console.log(this.teachingperiod)}
  addBreak(teachingPeriod){
    console.log('adding break',this.modal);
    this.modal.show(teachingPeriod);
  }
  caretClass(){return'fa fa-caret-'+this.reverse ? 'down' : 'up'}
}
