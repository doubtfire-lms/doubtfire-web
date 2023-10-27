import { Component, Input, Inject, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { User } from 'src/app/api/models/doubtfire-model';
import { MatPaginator } from '@angular/material/paginator';
import { UserService } from 'src/app/api/models/doubtfire-model';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'f-users',
  templateUrl: './f-users.component.html',
  styleUrls: ['./f-users.component.scss'],
})
export class FUsersComponent {
  @ViewChild(MatTable, { static: false }) table: MatTable<User>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'username',
    'email',
    'systemRole',
  ]
  public dataSource: MatTableDataSource<User>;
  dataload: Boolean;

  constructor(
    private userService: UserService,
    private globalStateService: GlobalStateService
  ) {
    this.dataload = false;
  }


  ngOnInit(): void {
    this.globalStateService.setView(ViewType.OTHER);
    this.loadAllUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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



}
