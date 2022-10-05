import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from 'src/app/api/models/task';
import { SelectedTaskService } from 'src/app/projects/states/dashboard/selected-task.service';

@Component({
  selector: 'f-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(private selectedTaskService: SelectedTaskService) {}

  selectedTask$: Observable<Task>;

  ngOnInit(): void {
    // watch for changes to the selected task
    this.selectedTask$ = this.selectedTaskService.selectedTask$;

    // this.selectedTask$.subscribe(this.selectedTaskService.selectedTask$);
    this.selectedTask$.subscribe((task) => {
      console.log(task.project.student);
    });
  }
}
