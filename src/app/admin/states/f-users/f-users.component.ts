import { Component, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { User } from 'src/app/api/models/doubtfire-model';
import { MatPaginator } from '@angular/material/paginator';
import { UserService } from 'src/app/api/models/doubtfire-model';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
import { EditProfileDialogService } from 'src/app/common/modals/edit-profile-dialog/edit-profile-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'f-users',
  templateUrl: './f-users.component.html',
  styleUrls: ['./f-users.component.scss'],
})
export class FUsersComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatTable, { static: false }) table: MatTable<User>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns: string[] = ['avatar', 'id', 'firstName', 'lastName', 'username', 'email', 'systemRole'];
  public dataSource: MatTableDataSource<User>;
  public filter: string;
  dataload: boolean;

  private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private globalStateService: GlobalStateService,
    private editProfileDialogService: EditProfileDialogService,
  ) {
    this.dataload = false;
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource(this.userService.cache.currentValuesClone());
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any, filter: string) => data.matches(filter);

    this.subscriptions.push(
      this.userService.cache.values.subscribe((users) => {
        this.dataSource.data = users;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public showUserModal(user: User) {
    const userToShow = user ? user : this.userService.createInstanceFrom({});
    this.editProfileDialogService.openDialog(userToShow);
  }

  public compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public sortData(sort: Sort) {
    const data = this.dataSource.data;

    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';

      switch (sort.active) {
        case 'id':
          return this.compare(a.id, b.id, isAsc);
        case 'firstName':
          return this.compare(a.firstName, b.firstName, isAsc);
        case 'lastName':
          return this.compare(a.lastName, b.lastName, isAsc);
        case 'systemRole':
          return this.compare(a.systemRole, b.systemRole, isAsc);
        default:
          return 0;
      }
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
