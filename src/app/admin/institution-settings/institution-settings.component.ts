import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

type InstitutionSettingsTabKey =
  | 'campuses'
  | 'activities'
  | 'teaching-periods'
  | 'learning-outcomes'
  | 'overseer-images'
  | 'turnitin';

interface InstitutionSettingsTab {
  label: string;
  routeSegment: InstitutionSettingsTabKey;
  enabled: boolean;
}

@Component({
  selector: 'institution-settings',
  templateUrl: 'institution-settings.component.html',
  styleUrls: ['institution-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class InstitutionSettingsComponent implements OnInit, OnDestroy {
  public currentTab: InstitutionSettingsTab = {
    label: 'Campuses',
    routeSegment: 'campuses',
    enabled: true,
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private constants: DoubtfireConstants,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.updateCurrentTabFromState(this.route.snapshot.paramMap.get('tab'));

    this.subscriptions.push(
      this.route.paramMap.subscribe((params) => this.updateCurrentTabFromState(params.get('tab'))),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public get tabs(): InstitutionSettingsTab[] {
    const tabs: InstitutionSettingsTab[] = [
      {label: 'Campuses', routeSegment: 'campuses', enabled: true},
      {label: 'Activities', routeSegment: 'activities', enabled: true},
      {label: 'Teaching Periods', routeSegment: 'teaching-periods', enabled: true},
      {label: 'Learning Outcomes', routeSegment: 'learning-outcomes', enabled: true},
      {label: 'Overseer Images', routeSegment: 'overseer-images', enabled: this.overseerEnabled},
      {label: 'TurnItIn', routeSegment: 'turnitin', enabled: this.tiiEnabled},
    ];

    return tabs.filter((tab) => tab.enabled);
  }

  public get currentIndex(): number {
    const index = this.tabs.findIndex((tab) => tab.routeSegment === this.currentTab.routeSegment);
    return index >= 0 ? index : 0;
  }

  public get overseerEnabled(): boolean {
    return this.constants.IsOverseerEnabled.value;
  }

  public get tiiEnabled(): boolean {
    return this.constants.IsTiiEnabled.value;
  }

  public onTabChange(event: MatTabChangeEvent): void {
    const nextTab = this.tabs[event.index] ?? this.tabs[0];
    this.currentTab = nextTab;
    this.router.navigate(['/admin/institution-settings', nextTab.routeSegment], {replaceUrl: true});
  }

  private updateCurrentTabFromState(tabParam?: string | null): void {
    this.currentTab =
      this.tabs.find((tab) => tab.routeSegment === tabParam) ??
      this.tabs.find((tab) => tab.routeSegment === 'campuses') ??
      this.tabs[0];
  }
}
