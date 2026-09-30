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
  protected abstract readonly routeSegment: string;

  protected constructor(
    protected route: ActivatedRoute,
    protected router: Router,
  ) {}

  /**
   * Tabs offered to the user - subclasses narrow this to hide conditional tabs
   */
  public get visibleTabs(): T[] {
    return this.tabs;
  }

  /**
   * Get the index of the currently active tab
   */
  public get currentIndex(): number {
    const index = this.visibleTabs.findIndex(
      (tab) => tab.routeSegment === this.currentTab.routeSegment,
    );
    return index >= 0 ? index : 0;
  }

  /**
   * Handle tab change events and update routing
   * @param event - MatTabChangeEvent from the tab component
   */
  public onTabChange(event: MatTabChangeEvent): void {
    const nextTab = this.visibleTabs[event.index] ?? this.visibleTabs[0];
    this.currentTab = nextTab;
    if (this.route.parent?.snapshot.data.unit) {
      this.router.navigate(
        [
          '/units',
          this.route.parent.snapshot.paramMap.get('unitId'),
          this.routeSegment,
          nextTab.routeSegment,
        ],
        {replaceUrl: true},
      );
    }
  }

  /**
   * Update the current tab based on route parameter
   * @param tabParam - The tab route segment from URL
   */
  protected updateCurrentTabFromState(tabParam?: string | null): void {
    this.currentTab =
      this.visibleTabs.find((tab) => tab.routeSegment === tabParam) ?? this.visibleTabs[0];
  }
}
