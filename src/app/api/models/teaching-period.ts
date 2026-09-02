import {Entity, EntityCache, EntityMapping} from 'ngx-entity-service';
import {Observable} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {MILLISECONDS_PER_WEEK, addDays, startOfDay} from './calendar-day';
import {TeachingPeriodBreakService, TeachingPeriodService, Unit} from './doubtfire-model';

export class TeachingPeriodBreak extends Entity {
  id: number;
  startDate: Date;
  numberOfDays: number;
  label: string;
  campusIds: number[] = [];
  pauseWeekCount: boolean = true;

  /**
   * Only breaks that span whole teaching weeks can pause the week count.
   */
  public get canPauseWeekCount(): boolean {
    return this.numberOfDays > 0 && this.numberOfDays % 7 === 0;
  }

  /**
   * The day teaching resumes after this break.
   */
  public get endDate(): Date | null {
    const start = this.numberOfDays ? startOfDay(this.startDate) : null;
    return start === null ? null : addDays(start, this.numberOfDays);
  }

  /**
   * Is the given date within this break?
   */
  public covers(date: Date | string): boolean {
    const day = startOfDay(date);
    const start = startOfDay(this.startDate);
    const end = this.endDate;

    return day !== null && start !== null && end !== null && day >= start && day < end;
  }
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
  public override toJson<T extends Entity>(
    mappingData: EntityMapping<T>,
    ignoreKeys?: string[],
  ): object {
    return {
      teaching_period: super.toJson(mappingData, ignoreKeys),
    };
  }

  public get name(): string {
    return `${this.period} ${this.year}`;
  }

  public get breaks(): readonly TeachingPeriodBreak[] {
    return this.breaksCache.currentValues;
  }

  /**
   * The breaks that pause the week count. Breaks without this flag still extend
   * deadlines, but the week number continues through them so that it stays
   * aligned across campuses.
   */
  public get weekPausingBreaks(): readonly TeachingPeriodBreak[] {
    return this.breaks.filter((teachingBreak) => teachingBreak.pauseWeekCount);
  }

  public breaksFor(campusId?: number): readonly TeachingPeriodBreak[] {
    return this.breaks.filter(
      (teachingBreak) =>
        teachingBreak.campusIds.length === 0 ||
        (campusId && teachingBreak.campusIds.includes(campusId)),
    );
  }

  public breakAt(date: Date | string): TeachingPeriodBreak | null {
    return this.findBreakAt(this.breaks, date);
  }

  /**
   * The break covering this date that also pauses the week count. Breaks that do
   * not pause it run alongside a teaching week rather than replacing it.
   */
  public weekPausingBreakAt(date: Date | string): TeachingPeriodBreak | null {
    return this.findBreakAt(this.weekPausingBreaks, date);
  }

  private findBreakAt(
    breaks: readonly TeachingPeriodBreak[],
    date: Date | string,
  ): TeachingPeriodBreak | null {
    const target = this.normalizeDay(date);
    if (!target) {
      return null;
    }

    return breaks.find((teachingBreak) => teachingBreak.covers(target)) ?? null;
  }

  public get units(): readonly Unit[] {
    return this.unitsCache.currentValues;
  }

  public hasUnit(unit: Unit): boolean {
    return unit && this.unitsCache.has(unit?.id);
  }

  public hasUnitWithCode(code: string): boolean {
    return this.unitsCache.currentValues.some((u) => u.code === code);
  }

  /**
   * Check if a unit with a matching code exists in this teaching period.
   *
   * @param unit unit to check against
   * @returns true if there is a unit with the same code in this teaching period
   */
  public hasUnitLike(unit: Unit): boolean {
    return unit && this.unitsCache.currentValues.some((u) => u.code === unit.code);
  }

  public addBreak(
    startDate: Date,
    days: number,
    campusIds: number[] = [],
    label?: string,
    pauseWeekCount: boolean = true,
  ): Observable<TeachingPeriodBreak> {
    const breakEntity = new TeachingPeriodBreak();
    breakEntity.startDate = startDate;
    breakEntity.numberOfDays = days;
    breakEntity.label = label;
    breakEntity.campusIds = campusIds;
    breakEntity.pauseWeekCount = pauseWeekCount;
    const breakService: TeachingPeriodBreakService = AppInjector.get(TeachingPeriodBreakService);

    return breakService.create(
      {teaching_period_id: this.id},
      {cache: this.breaksCache, entity: breakEntity},
    );
  }

  /**
   * Removes a teaching period break.
   * @param teachingBreakID the ID of the teaching period break to remove
   * @returns an observable that emits the teaching period with the removed break, and indicates if any errors occured
   */
  public removeBreak(teachingBreakID: number): Observable<TeachingPeriodBreak> {
    const breakService: TeachingPeriodBreakService = AppInjector.get(TeachingPeriodBreakService);
    return breakService.delete(
      {teaching_period_id: this.id, id: teachingBreakID},
      {cache: this.breaksCache},
    );
  }

  public rollover(
    newPeriod: TeachingPeriod,
    rolloverInactive: boolean,
    searchForward: boolean,
  ): Observable<boolean> {
    const teachingPeriodService: TeachingPeriodService = AppInjector.get(TeachingPeriodService);

    return teachingPeriodService.post<boolean>(
      {
        id: this.id,
        new_teaching_period_id: newPeriod.id,
        rollover_inactive: rolloverInactive,
        search_forward: searchForward,
      },
      {
        endpointFormat: TeachingPeriodService.rolloverEndpointFormat,
      },
    );
  }

  public weekNumber(date: Date | string): number | null {
    if (!date || !this.startDate) {
      return null;
    }

    const targetDate = this.normalizeDay(date);
    const startDate = this.normalizeDay(this.startDate);
    if (!targetDate || !startDate) {
      return null;
    }

    let result =
      Math.floor((targetDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_WEEK) + 1;

    for (const teachingBreak of this.weekPausingBreaks) {
      const breakStart = this.normalizeDay(teachingBreak.startDate);
      const breakEnd = this.breakEndDate(teachingBreak);
      const firstMonday = this.firstMonday(teachingBreak);
      const mondayAfterBreak = this.mondayAfterBreak(teachingBreak);

      if (!breakStart || !breakEnd || !firstMonday || !mondayAfterBreak) {
        continue;
      }

      if (targetDate >= breakStart) {
        if (targetDate >= breakEnd) {
          result -= Math.ceil(teachingBreak.numberOfDays / 7);
        } else if (targetDate.getTime() === breakStart.getTime()) {
          if (targetDate >= firstMonday) {
            result -= 1;
          }
        } else if (targetDate >= firstMonday) {
          result -= Math.ceil(
            (targetDate.getTime() - firstMonday.getTime()) / MILLISECONDS_PER_WEEK,
          );
        }

        if (targetDate >= breakEnd && targetDate < mondayAfterBreak) {
          result += 1;
        }
      }
    }

    return result;
  }

  private normalizeDay(date: Date | string | null | undefined): Date | null {
    return startOfDay(date);
  }

  private breakEndDate(teachingBreak: TeachingPeriodBreak): Date | null {
    return teachingBreak.endDate;
  }

  private firstMonday(teachingBreak: TeachingPeriodBreak): Date | null {
    const startDate = this.normalizeDay(teachingBreak.startDate);
    if (!startDate) {
      return null;
    }

    if (startDate.getUTCDay() === 1) {
      return startDate;
    }
    if (startDate.getUTCDay() === 0) {
      return addDays(startDate, 1);
    }

    return addDays(startDate, 8 - startDate.getUTCDay());
  }

  private mondayAfterBreak(teachingBreak: TeachingPeriodBreak): Date | null {
    const firstMonday = this.firstMonday(teachingBreak);
    if (!firstMonday || !teachingBreak.numberOfDays) {
      return null;
    }

    return addDays(firstMonday, teachingBreak.numberOfDays);
  }
}
