import { Component, ElementRef, Inject, Input, Injector, OnInit, Optional } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { Project } from 'src/app/api/models/project';
import { Unit } from 'src/app/api/models/unit';
import { visualisations } from 'src/app/ajs-upgraded-providers';

/**
 * Hosts the AngularJS `projectProgressDashboard` directive inside Angular templates
 * (same charts and target-grade UI as the legacy portfolios “View Progress” tab).
 */
@Component({
  selector: 'f-ajs-project-progress-dashboard',
  template: '',
})
export class AjsProjectProgressDashboardComponent extends UpgradeComponent implements OnInit {
  @Input() project: Project;
  @Input() unit: Unit;

  constructor(
    elementRef: ElementRef,
    injector: Injector,
    @Optional() @Inject(visualisations) private readonly visualisationApi: { refreshAll?: () => void } | null,
  ) {
    super('projectProgressDashboard', elementRef, injector);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Burndown / pie use legacy visualisation lifecycle; match UnitPortfoliosStateCtrl.refreshCharts.
    setTimeout(() => this.visualisationApi?.refreshAll?.(), 0);
  }
}
