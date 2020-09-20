import { Component, Input, Inject, OnInit } from '@angular/core';
//import { PlagiarismReportModal } from 'src/app/tasks/modals/plagiarism-report-modal/plagiarism-report-modal'  


@Component({
  selector: 'task-plagiarism-card',
  templateUrl: 'task-plagiarism-card.component.html',
})
export class TaskPlagiarismCardComponent implements OnInit {  
  @Input() task: any; 

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor() {
    
  }  
  // constructor(@Inject(PlagiarismReportModal) private plagiarismReportModal: any) {
  //     //viewReport = plagiarismReportModal.show(task)
  //  }  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  
  viewReport(): void {
    //plagiarismReportModal.show(task)
  }
}