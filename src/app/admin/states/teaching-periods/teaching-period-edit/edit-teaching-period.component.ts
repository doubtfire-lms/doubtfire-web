import { ActivatedRoute } from '@angular/router';
import { StateParams, StateService, UIRouter } from '@uirouter/core';

import { Component, Inject, OnInit } from '@angular/core';
import { TeachingPeriod, TeachingPeriodService } from 'src/app/api/models/doubtfire-model';
import { alertService } from 'src/app/ajs-upgraded-providers';
import * as _ from 'lodash';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'edit-teaching-period',
  templateUrl: 'edit-teaching-period.component.html',
  styleUrls: ['edit-teaching-period.component.scss'],
})
export class EditTeachingPeriodComponent {
  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  teachingPeriod?: TeachingPeriod;
  dataFetched: Boolean = false;
  id;

  constructor(
    private teachingPeriodService: TeachingPeriodService,
    @Inject(alertService) private alerts: any,
    private stateService: StateService
  ) {
    // Using deperectated params to extract id until proper routing is implemented
   this.id= this.stateService.params.id;
    // Get all the activity types and add them to the table
    this.teachingPeriodService.get(Number(this.id)).subscribe((result) => {
      this.teachingPeriod = result;
      this.dataFetched = !this.dataFetched;
     
    });
  }
   teachingPeriodUpdated(updated) {
    if (updated) {
      this.teachingPeriodService.get(Number(this.id)).subscribe((result) => {
    
      
      // Create new instance to trigger change detection of child components
      this.teachingPeriod  = _.clone(result);
      
     
    });
    }
  }
}
