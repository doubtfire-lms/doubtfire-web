import {AsyncPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs';
import {Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {ConvenorComponent} from './convenor/convenor.component';
import {DashboardQueue} from './dashboard-queue';
import {TutorComponent} from './tutor/tutor.component';

@Component({
  imports: [
    AsyncPipe,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    ConvenorComponent,
    TutorComponent,
  ],
  selector: 'f-unit-dashboard',
  host: {
    class:
      'box-border flex min-h-[calc(100dvh-160px)] items-center justify-center px-4 py-6 sm:px-6 sm:py-8',
  },
  styleUrl: './unit-dashboard.component.css',
  templateUrl: './unit-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class UnitDashboardComponent {
  protected selectedStaff: UnitRole | null = null;

  protected activeView: 'Convenor' | 'Tutor' | null = null;

  protected selectStaff(staff: UnitRole | null): void {
    this.selectedStaff = staff;
    this.activeView = null;
  }

  protected teachesTutorials(unit: Unit, staff?: UnitRole): boolean {
    return (
      !!staff?.user?.id && unit.tutorials.some((tutorial) => tutorial.tutor?.id === staff.user.id)
    );
  }

  public readonly dashboard$ = this.route.parent.data.pipe(
    map(({unit}: {unit?: Unit}) => {
      this.selectStaff(null);
      if (!unit) {
        return null;
      }

      const entity = this.globalStateService.currentViewAndEntitySubject$.value?.entity;
      const role = entity instanceof UnitRole && entity.unit.id === unit.id ? entity : null;
      const staffRole = role && unit.staff.find((staff) => staff.id === role.id);

      return {
        unit,
        unitRole: role?.role,
        staffRole,
        ownName: staffRole?.user?.name ?? role?.user?.name,
        otherStaff:
          role?.role === 'Convenor'
            ? unit.staff
                .filter((staff) => staff.id !== role.id)
                .sort((a, b) => a.user.name.localeCompare(b.user.name))
            : [],
        queues: this.dashboardQueues(unit, role),
        showTimesheet: !!staffRole && role.role === 'Tutor',
      };
    }),
  );

  constructor(
    private route: ActivatedRoute,
    private globalStateService: GlobalStateService,
  ) {}

  protected dashboardQueues(unit: Unit, role: UnitRole | null): DashboardQueue[] {
    const queues: DashboardQueue[] = [];

    if (role?.role === 'Convenor' || (role?.id && unit.staff.some((s) => s.mentorId === role.id))) {
      queues.push({
        path: 'moderation',
        title: 'Moderation queue',
        role: 'Moderator',
        icon: 'rate_review',
      });
    }

    if (role && unit.staff.find((s) => s.id === role.id)?.canMarkOverflowTasks) {
      queues.push({
        path: 'overflow',
        title: 'Overflow queue',
        role: 'Overflow tutor',
        icon: 'more_time',
      });
    }

    return queues;
  }
}
