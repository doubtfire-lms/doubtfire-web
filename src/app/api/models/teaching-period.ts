import { Entity, EntityCache, EntityMapping } from 'ngx-entity-service';
import { Observable } from 'rxjs';
import { AppInjector } from 'src/app/app-injector';
import { TeachingPeriodBreakService, TeachingPeriodService, Unit, UnitService, User } from './doubtfire-model';

export class TeachingPeriodBreak extends Entity {
  id: number;
  startDate: Date;
  numberOfWeeks: number;
}

export class TeachingPeriod extends Entity {
  id: number;
  period: string;
  year: string;
  startDate: Date;
  endDate: Date;
  activeUntil: string;
  active: boolean;

  breaksCache: EntityCache<TeachingPeriodBreak> = new EntityCache<TeachingPeriodBreak>();
  unitsCache: EntityCache<Unit> = new EntityCache<Unit>();

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

  public name(): string {
    return `${this.period} ${this.year}`;
  }

  public get breaks(): readonly TeachingPeriodBreak[] {
    return this.breaksCache.currentValues;
  }

  public get units(): readonly Unit[] {
    return this.unitsCache.currentValues;
  }

  public addBreak(startDate: Date, weeks: number) : Observable<TeachingPeriodBreak> {
    const breakEntity = new TeachingPeriodBreak();
    breakEntity.startDate = startDate;
    breakEntity.numberOfWeeks = weeks;
    const breakService: TeachingPeriodBreakService = AppInjector.get(TeachingPeriodBreakService);

    return breakService.create({teaching_period_id: this.id}, {cache: this.breaksCache, entity: breakEntity});
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
