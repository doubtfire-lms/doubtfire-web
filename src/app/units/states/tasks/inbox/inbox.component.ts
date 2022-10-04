import { Component, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/core';

@Component({
  selector: 'f-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent implements OnInit {
  taskData;
  constructor(private router: UIRouter) {
    console.log('here');
    console.log(this.router.globals.params);
    this.taskData = this.router.globals.params.taskKey;
  }

  ngOnInit(): void {}
}
