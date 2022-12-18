import { Observable, tap } from 'rxjs';

import { UIRouter } from '@uirouter/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { AfterViewInit, Component, Inject, Input, ViewChild, Output } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort, Sort } from '@angular/material/sort';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';
import { TeachingPeriod, TeachingPeriodBreak, TeachingPeriodBreakService } from 'src/app/api/models/doubtfire-model';
import { AppInjector } from 'src/app/app-injector';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'teaching-period-breaks',
  templateUrl: 'teaching-period-breaks.component.html',
  styleUrls: ['teaching-period-breaks.component.scss'],
})
export class TeachingPeriodBreaksComponent extends EntityFormComponent<TeachingPeriodBreak> implements AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() teachingPeriod: TeachingPeriod;
  // Set up the table
  columns: string[] = ['startDate', 'numberOfWeeks', 'options'];
  breaks: TeachingPeriodBreak[] = new Array<TeachingPeriodBreak>();

  dataSource = new MatTableDataSource(this.breaks);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    private teachingPeriodBreakService: TeachingPeriodBreakService,
    @Inject(alertService) private alerts: any,
    @Inject(UIRouter) private router: UIRouter
  ) {
    super({
      number_of_weeks: new FormControl('', [Validators.required]),
      start_date: new FormControl('', [Validators.required]),
    },'TeachingPeriodBreak');
  }

  ngOnInit() {
   
    this.teachingPeriodBreakService.query({ teaching_period_id: this.teachingPeriod.id }).subscribe((breaks) => {
      this.pushToTable(breaks);
    });
  }
  

  // Push the values that will be displayed in the table
  // to the datasource
  private pushToTable(value: TeachingPeriodBreak | TeachingPeriodBreak[]) {
    value instanceof Array ? this.breaks.push(...value) : this.breaks.push(value);
    this.dataSource.sort = this.sort;
    this.table.renderRows();
  }
  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.teachingPeriodBreakService, this.alerts, this.onSuccess.bind(this));
  }
  submitForm() {

    
    this.teachingPeriod.addBreak(this.formData.get('start_date').value,this.formData.get('number_of_weeks').value ).subscribe({
      
      next: (result: TeachingPeriodBreak) => {
        this.alerts.add('success', 'Break Added successfully');

        if (this.selected) {
          this.selected = null;
          this.backup = {};
        }
        // Reset the form to default values
        this.formData.reset(this.defaultFormData);
         this.pushToTable(result);
      },
      error: (error) => {
        // Whoops - an error

        this.alerts.add('danger', `Save failed: ${error}`, 6000);
      },
    });
  }

  // This method is passed to the submit method on the parent
  // and is only run when an entity is successfully created or updated
  onSuccess(response: TeachingPeriodBreak, isNew: boolean) {
    if (isNew) {
      this.pushToTable(response);
    }
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    switch (sort.active) {
      case 'start_date':
      case 'number_of_weeks':
        return super.sortTableData(sort);
    }
  }
}
