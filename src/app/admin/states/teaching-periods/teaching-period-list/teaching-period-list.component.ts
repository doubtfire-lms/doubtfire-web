import { Component, OnInit, Input, Inject } from '@angular/core';
import { alertService,teachingPeriod  } from 'src/app/ajs-upgraded-providers';
import { TaskComment, TaskCommentService} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'teaching-period-list',
  templateUrl: './teaching-period-list.component.html'
})
export class TeachingPeriodListComponent implements OnInit {
  @Input() teachingPeriods: any;

  constructor(@Inject(alertService) private alerts: any,@Inject(teachingPeriod) private teachingPeriod: any) {}

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  ngOnInit() {
    this.teachingPeriods = teachingPeriod.query()
    console.log("teachingPeriods====",this.teachingPeriods);
  }
}
