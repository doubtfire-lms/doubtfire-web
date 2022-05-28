import { Entity, EntityCache, EntityMapping } from 'ngx-entity-service';
import { Observable } from 'rxjs';
import { AppInjector } from 'src/app/app-injector';
import { TeachingPeriodBreakService, TeachingPeriodService, Unit, UnitService, User } from './doubtfire-model';

export class TeachingPeriodBreak extends Entity {
  id: number;
  startDate: string;
  numberOfWeeks: number;

}

export class TeachingPeriod extends Entity {

  id: number;
  period: string;
  year: string;
  startDate: string; //TODO: Date
  endDate: string; //TODO: Date
  activeUntil: string;
  active: boolean;

  breaks: EntityCache<TeachingPeriodBreak> = new EntityCache<TeachingPeriodBreak>();
  units: EntityCache<Unit> = new EntityCache<Unit>();

  /**
   * Override to json to store in teaching period root node.
   * @param mappingData
   * @param ignoreKeys
   * @returns
   */
  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      teaching_period: super.toJson(mappingData, ignoreKeys)
    };
  }

  public addBreak(breakEntity: TeachingPeriodBreak) : Observable<TeachingPeriodBreak> {
    const breakService: TeachingPeriodBreakService = AppInjector.get(TeachingPeriodBreakService);

    return breakService.store(breakEntity, {cache: this.breaks});
  }

  public rollover(newPeriod: TeachingPeriod, rolloverInactive: boolean, searchForward: boolean) : Observable<boolean> {
    const teachingPeriodService: TeachingPeriodService = AppInjector.get(TeachingPeriodService);

    return teachingPeriodService.post<boolean>(
      {
        id: this.id,
        new_teaching_period_id: newPeriod.id,
        rollover_inactive: rolloverInactive,
        search_forward: searchForward
      },
      {
        endpointFormat: TeachingPeriodService.rolloverEndpointFormat
      }
    );
  }


}
