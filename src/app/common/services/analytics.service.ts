import {Injectable} from '@angular/core';
import {UserService} from 'src/app/api/services/user.service';
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(private newUserService: UserService) {}

  // logs new event with category and event name.
  // category - pluralized category name
  // eventName - past-tense event name
  // label - optional, but should be a string
  // value - optional, but must be a positive number

  public logEvent(category: string, eventName: string, label?: string, value?: number): void {
    if (!this.newUserService.currentUser.optInToResearch) {
      return;
    }
    if (value !== undefined && (typeof value !== 'number' || value < 0)) {
      throw new Error('Value needs to be a positive number');
    }
    console.log(`[Analytics] Event: "${eventName}"`, {
      category,
      label,
      value,
    });
  }

  public watchEvent(
    scope: {$watch: <T>(variable: string, callback: (newVal: T, oldVal: T) => void) => void},
    toWatch: string,
    category: string,
    label: string | ((newVal: unknown) => string),
  ): void {
    scope.$watch(toWatch, (newVal: unknown, oldVal: unknown) => {
      if (newVal !== undefined && newVal !== oldVal) {
        if (typeof label === 'function') {
          this.logEvent(category, `Changed ${toWatch}`, label(newVal));
        } else if (typeof newVal === 'number' && Number.isInteger(newVal)) {
          this.logEvent(category, `Changed ${toWatch}`, label, newVal);
        } else {
          this.logEvent(category, `Changed ${toWatch}`, String(newVal));
        }
      }
    });
  }
}
