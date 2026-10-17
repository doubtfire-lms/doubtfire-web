import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Unit, UnitRole, UnitService, UserService} from 'src/app/api/models/doubtfire-model';
import {
  TutorDashboardResponse,
  TutorDashboardTaskDefinition,
} from 'src/app/api/services/unit.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

@Component({
  selector: 'f-tutor-dashboard',
  templateUrl: './tutor-dashboard.component.html',
  styleUrl: './tutor-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TutorDashboardComponent implements OnInit, OnDestroy {
  unit: Unit;
  selectedUnitRole: UnitRole;
  dashboard: TutorDashboardResponse;
  loading = true;
  error = false;

  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private unitService: UnitService,
    private userService: UserService,
    private globalState: GlobalStateService,
    private alertService: AlertService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.unit = this.route.parent?.snapshot.data.unit;
    const currentUnitRole = this.unit.staff.find(
      (unitRole) => unitRole.user.id === this.userService.currentUser.id,
    );

    if (!currentUnitRole) {
      this.error = true;
      this.loading = false;
      return;
    }

    currentUnitRole.unit = this.unit;
    this.globalState.setView(ViewType.UNIT, currentUnitRole);

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const requestedRoleId = Number(params.get('unitRoleId')) || currentUnitRole.id;
      const requestedRole = this.unit.staff.find((unitRole) => unitRole.id === requestedRoleId);

      if (!requestedRole) {
        this.error = true;
        this.loading = false;
        return;
      }

      requestedRole.unit = this.unit;
      this.selectedUnitRole = requestedRole;
      this.loadDashboard();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  get selectableTutors(): UnitRole[] {
    return [...this.unit.staff]
      .filter((unitRole) => unitRole.role === 'Tutor' || unitRole.role === 'Convenor')
      .sort((left, right) => left.user.name.localeCompare(right.user.name));
  }

  get maxTaskDefinitionCount(): number {
    return Math.max(
      1,
      ...(this.dashboard?.inbox.by_task_definition ?? []).map(
        (row) => row.ready_for_feedback_count,
      ),
    );
  }

  taskDefinitionWidth(row: TutorDashboardTaskDefinition): number {
    return (row.ready_for_feedback_count / this.maxTaskDefinitionCount) * 100;
  }

  ageBucketWidth(count: number): number {
    const total = this.dashboard?.inbox.ready_for_feedback_count ?? 0;
    return total ? (count / total) * 100 : 0;
  }

  selectTutor(unitRoleId: number): void {
    this.router.navigate(['/units', this.unit.id, 'dashboard', unitRoleId]);
  }

  refresh(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.error = false;
    this.dashboard = null;

    this.unitService.tutorDashboard(this.unit, this.selectedUnitRole.id).subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.error = true;
        this.loading = false;
        this.alertService.error(`Unable to load tutor dashboard: ${error}`, 6000);
        this.changeDetector.markForCheck();
      },
    });
  }
}
