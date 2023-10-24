import { Component, Input, Inject, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { User } from 'src/app/api/models/doubtfire-model';
import { MatPaginator } from '@angular/material/paginator';
import { UserService } from 'src/app/api/models/doubtfire-model';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { Subscription } from 'rxjs';


export interface TempInterface {
  user_id: number;
  first_name: string;
}
const TABLE_DATA: TempInterface[] = [
  {user_id: 1, first_name: 'John'},
  {user_id: 2, first_name: 'Joseph'},
];




@Component({
  selector: 'f-users',
  templateUrl: './f-users.component.html',
  styleUrls: ['./f-users.component.scss'],
})
export class FUsersComponent {
  @ViewChild(MatTable, { static: false }) table: MatTable<User>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;


  // dataSource = TABLE_DATA;
  // displayedColumns: String[] = ['user_id', 'first_name'];



  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'username',
    'email',
    'systemRole',
  ]

  dataSource: MatTableDataSource<User>;
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

  }

  private loadAllUsers() {
    this.userService.query(undefined, { params: { include_in_active: true } }).subscribe({
      next: (users: User[]) => {
        this.dataSource = new MatTableDataSource<User>(users);
        this.dataload = true;
      },
      error: (failure) => {
        console.log(failure);
      }
    })
  }

}
