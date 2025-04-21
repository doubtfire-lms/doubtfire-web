import { Component, AfterViewInit, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { User } from 'src/app/api/models/doubtfire-model';
import { MatPaginator } from '@angular/material/paginator';
import { UserService } from 'src/app/api/models/doubtfire-model';
import { EditProfileDialogService } from 'src/app/common/modals/edit-profile-dialog/edit-profile-dialog.service';
import { Subscription } from 'rxjs';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader.service';
import { AlertService } from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class FUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatTable, { static: false }) table: MatTable<User>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns: string[] = ['avatar', 'firstName', 'lastName', 'username', 'email', 'systemRole'];
  public dataSource: MatTableDataSource<User>;
  public filter: string;
  dataload: boolean;

  private subscriptions: Subscription[] = [];
  externalName: string;
  uploadEndpoint: string;

  constructor(
    private userService: UserService,
    private editProfileDialogService: EditProfileDialogService,
    private constants: DoubtfireConstants,
    private fileDownloaderService: FileDownloaderService,
    private alerts: AlertService,
  ) {
    this.dataload = false;
  }

  ngOnInit(): void {
    this.userService.query().subscribe();
    this.constants.ExternalName.subscribe((externalName) => {
      this.externalName = externalName;
    });

    this.uploadEndpoint = this.userService.csvURL;
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource(this.userService.cache.currentValuesClone());
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data, filter: string) => data.matches(filter);

    this.subscriptions.push(
      this.userService.cache.values.subscribe((users) => {
        this.dataSource.data = users;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected downloadUsers() {
    this.fileDownloaderService.downloadFile(this.userService.csvURL, 'Users.csv');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // TODO: This needs to be brought out into a service which replaces the old csv-result-modal
  protected onUserUploadSuccess(event) {
    const max_full_errors = 5;
    const num_errors = event.body.errors?.length;
    const num_success = event.body.success?.length;
    const num_ignored = event.body.ignored?.length;

    // build error string
    let error_string = `${num_success} users successfully updated, `;
    error_string += `${num_ignored} users ignored, `;
    error_string += `${num_errors} users contained an error in the CSV...`;

    event.body.errors?.slice(0, max_full_errors).forEach((error) => {
      error_string += error.message + '\n';
    });

    max_full_errors > num_errors ? (error_string += `... and ${max_full_errors - num_errors} more`) : null;
    this.alerts.error(error_string);

    this.userService.query();
  }

  public showUserModal(user: User) {
    const userToShow = user ? user : this.userService.createInstanceFrom({});
    this.editProfileDialogService.openDialog(userToShow, 'edit');
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
