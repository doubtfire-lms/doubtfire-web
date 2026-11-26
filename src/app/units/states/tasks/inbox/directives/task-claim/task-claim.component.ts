import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Task} from 'src/app/api/models/task';
import {UnitRole} from 'src/app/api/models/unit-role';
import {TaskService} from 'src/app/api/services/task.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-task-claim',
  templateUrl: './task-claim.component.html',
  styleUrl: './task-claim.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskClaimComponent {
  @Input() selectedTask: Task;

  constructor(
    private taskService: TaskService,
    private alertService: AlertService,
    private snackBar: MatSnackBar,
    private userService: UserService,
  ) {}

  public get currentUnitRole(): UnitRole | undefined {
    const currentUser = this.userService.currentUser;
    return this.selectedTask.unit.staff.find((ur) => ur.user.id === currentUser.id);
  }

  claimTask(task: Task) {
    this.taskService.claimTask(task).subscribe({
      next: (_response) => {
        this.alertService.success(`Successfully claimed task`, 6000);
        this.snackBar.open(
          `Successfully claimed task. This task will be automatically unclaimed after 30 minutes of inactivity.`,
          'OK',
        );
        task.claimedByUnitRoleId = this.currentUnitRole.id;
      },
      error: (error) => {
        this.alertService.error(`Failed to claim task ${error}`, 6000);
      },
    });
  }
}
