import { HttpClient } from '@angular/common/http';
import {Entity, EntityCache, EntityMapping} from 'ngx-entity-service';
import {Observable, tap} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Unit, GroupSet, Project, Tutorial, ProjectService} from '../doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';

export class Group extends Entity {
  public id: number;
  public name: string;
  public groupSet: GroupSet;
  public tutorial: Tutorial;
  public capacityAdjustment: number;
  public locked: boolean;
  public studentCount: number;

  public readonly projectsCache: EntityCache<Project> = new EntityCache<Project>();

  public readonly unit: Unit;

  public get projects(): readonly Project[] {
    return this.projectsCache.currentValues;
  }

  public constructor(unit: Unit) {
    super();
    this.unit = unit;
  }

  /**
   * Returns the id of the groupset related to this group. Used to
   * determine the path for the service calls.
   */
  public get groupSetId(): number {
    return this.groupSet.id;
  }

  /**
   * Returns the id of the unit related to this group. Used to
   * determine the path for the service calls.
   */
  public get unitId(): number {
    return this.unit.id;
  }

  public toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      group: super.toJson(mappingData, ignoreKeys),
    };
  }

  public get memberCount(): number {
    if (this.projectsCache.size === 0) {
      return this.studentCount || 0;
    } else {
      return this.projectsCache.size;
    }
  }

  public get members(): readonly Project[] {
    return this.projectsCache.currentValues;
  }

  private memberUri(member?: Project): string {
    return `units/${this.unit.id}/group_sets/${this.groupSet.id}/groups/${this.id}/members/${
      member ? member.id : ''
    }`;
  }

  public addMember(member: Project, onSuccess?: () => void) {
    const alerts = AppInjector.get(AlertService);
    if (!member) {
      alerts.error('The student you are trying to add to the group could not be found.', 6000);
      return;
    }

    const httpClient = AppInjector.get(HttpClient);
    httpClient
      .post(`${AppInjector.get(DoubtfireConstants).API_URL}/${this.memberUri(member)}`, {})
      .subscribe({
        next: (success) => {
          // Get old group..
          const grp = member.groupForGroupSet(this.groupSet);
          if (grp) {
            // Remove current member from old group
            grp.projectsCache.delete(member);
            grp.studentCount--;
            member.groupCache.delete(grp);
          }
          // Add group to member
          member.groupCache.add(this);
          this.studentCount++;

          // Has members so add this member
          this.projectsCache.add(member);
          alerts.success(`${member.student.name} was added to '${this.name}'`, 3000);
          if (onSuccess) onSuccess();
        },
        error: (message) => alerts.error(message || 'Unknown Error', 6000),
      });
  }

  public removeMember(member: Project) {
    const alerts = AppInjector.get(AlertService);
    if (!member) {
      alerts.error('The student you are trying to add to the group could not be found.', 6000);
      return;
    }

    const httpClient = AppInjector.get(HttpClient);
    httpClient
      .delete(`${AppInjector.get(DoubtfireConstants).API_URL}/${this.memberUri(member)}`, {})
      .subscribe({
        next: (success) => {
          // Get old group..
          this.projectsCache.delete(member);
          member.groupCache.delete(this);
          this.studentCount--;
          alerts.success(`${member.student.name} was removed from '${this.name}'`, 3000);
        },
        error: (message) => alerts.error(message || 'Unknown Error', 6000),
      });
  }

  public getMembers(): Observable<Project[]> {
    const projectService = AppInjector.get(ProjectService);

    return projectService
      .query(
        {},
        {
          endpointFormat: this.memberUri(),
          cache: this.unit.studentCache,
          sourceCache: this.unit.studentCache,
          constructorParams: this.unit,
          onQueryCacheReturn: 'previousQuery',
        },
      )
      .pipe(
        tap((projects: Project[]) => {
          projects.forEach((p) => this.projectsCache.add(p));
        }),
      );
  }

  public hasSpace(): boolean {
    if (!this.groupSet.capacity) {
      return false;
    } else {
      return this.memberCount < this.groupSet.capacity + this.capacityAdjustment;
    }
  }

  public contributionSum(
    contrib: {project: Project; rating: number; confRating: number; percent: number}[],
    member?: Project,
    value?: number,
  ): number {
    return contrib.reduce<number>(
      (
        prevValue: number,
        current: {project: Project; rating: number; confRating: number; percent: number},
      ) => {
        if (current.project === member) {
          return prevValue + value;
        } else {
          return prevValue + current.rating;
        }
      },
      0,
    );
  }
}
