import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';

/**
 * Generic tab interface for routing-based tab components
 */
export interface Tab {
  label: string;
  routeSegment: string;
}

/**
 * Base class for managing tabbed navigation with route synchronization
 * Reduces duplication in components that implement tab switching with routing
 */
export abstract class TabManagementBase<T extends Tab> {
  public abstract tabs: T[];
  public abstract currentTab: T;

  protected constructor(
    protected route: ActivatedRoute,
    protected router: Router,
  ) {}

  /**
   * Get the index of the currently active tab
   */
  public get currentIndex(): number {
    const index = this.tabs.findIndex((tab) => tab.routeSegment === this.currentTab.routeSegment);
    return index >= 0 ? index : 0;
  }

  /**
   * Handle tab change events and update routing
   * @param event - MatTabChangeEvent from the tab component
   * @param routeSegment - The route segment (e.g., 'admin' or 'analytics')
   */
  public onTabChange(event: MatTabChangeEvent, routeSegment: string): void {
    const nextTab = this.tabs[event.index] ?? this.tabs[0];
    this.currentTab = nextTab;
    if (this.route.parent?.snapshot.data.unit) {
      this.router.navigate(
        [
          '/units',
          this.route.parent.snapshot.paramMap.get('unitId'),
          routeSegment,
          nextTab.routeSegment,
        ],
        {replaceUrl: true},
      );
    }
  }

  /**
   * Update the current tab based on route parameter
   * @param tabParam - The tab route segment from URL
   * @param defaultTab - The default tab route segment if parameter not found
   */
  protected updateCurrentTabFromState(tabParam?: string | null, defaultTab?: string): void {
    this.currentTab =
      this.tabs.find((tab) => tab.routeSegment === tabParam) ??
      (defaultTab ? this.tabs.find((tab) => tab.routeSegment === defaultTab) : undefined) ??
      this.tabs[0];
  }
}
