import { Component, Input, Inject, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { User } from 'src/app/api/models/doubtfire-model';
import { MatPaginator } from '@angular/material/paginator';
import { UserService } from 'src/app/api/models/doubtfire-model';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { EditProfileDialogService } from 'src/app/common/modals/edit-profile-dialog/edit-profile-dialog.service';

@Component({
  selector: 'f-users',
  templateUrl: './f-users.component.html',
  styleUrls: ['./f-users.component.scss'],
})
export class FUsersComponent implements AfterViewInit {
  @ViewChild(MatTable, { static: false }) table: MatTable<User>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns: string[] = [
    'avatar',
    'id',
    'firstName',
    'lastName',
    'username',
    'email',
    'systemRole',
  ]
  public dataSource: MatTableDataSource<User>;
  public filter: String;
  dataload: Boolean;

  constructor(
    private userService: UserService,
    private globalStateService: GlobalStateService,
    private editProfileDialogService: EditProfileDialogService,
  ) {
    this.dataload = false;
  }

  ngOnInit(): void {
    this.globalStateService.setView(ViewType.OTHER);
    this.loadAllUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any, filter: string) => data.matches(filter);
  }

  private loadAllUsers() {
    this.userService.query(undefined, { params: { include_in_active: true } }).subscribe({
      next: (users: User[]) => {
        this.dataSource = new MatTableDataSource<User>(users);
        this.dataSource.paginator = this.paginator;
        this.dataload = true;
      },
      error: (failure) => {
        console.log(failure);
      }
    })
  }

  public showUserModal(user: User) {
    let userToShow = user ? user : this.userService.createInstanceFrom({});
    this.editProfileDialogService.openDialog(userToShow);
  }

  public compare(a: number | string, b: number | string, isAsc: Boolean): number {
    return (a < b ? -1 : 1) * (isAsc? 1 : -1);
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
    })
  }

  applyFilter(filterValue: String) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
