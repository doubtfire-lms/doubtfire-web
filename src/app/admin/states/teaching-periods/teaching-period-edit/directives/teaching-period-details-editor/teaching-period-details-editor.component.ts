import { FormControl, Validators, FormGroup } from '@angular/forms';
import { TeachingPeriod, TeachingPeriodService } from 'src/app/api/models/doubtfire-model';
import { Component, OnInit, Input, Inject, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';
import { alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'teaching-period-details-editor',
  templateUrl: './teaching-period-details-editor.component.html',
  styleUrls: ['./teaching-period-details-editor.component.scss'],
})
export class TeachingPeriodDetailsEditorComponent
  extends EntityFormComponent<TeachingPeriod>
  implements OnInit, OnChanges
{
  @Input() teachingPeriod: TeachingPeriod;
  @Output() teachingPeriodUpdatedEvent = new EventEmitter<boolean>();
  constructor(private teachingPeriodService: TeachingPeriodService, @Inject(alertService) private alerts: any) {
    super({
      period: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      year: new FormControl('', [Validators.required]),
      activeUntil: new FormControl('', [Validators.required]),
    },'TeachingPeriod');
  }
  ngOnInit(): void {
    this.flagEdit(this.teachingPeriod);
  }
  ngOnChanges(changes: SimpleChanges) {
   
   
     this.flagEdit(this.teachingPeriod);
  }
  onSuccess(response: TeachingPeriod, isNew: boolean) {
    
    this.teachingPeriodUpdatedEvent.emit(true);
  }

  submit() {
    super.submit(this.teachingPeriodService, this.alerts, this.onSuccess.bind(this));
  }
}
