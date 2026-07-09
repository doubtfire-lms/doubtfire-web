import {HttpClient} from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {finalize} from 'rxjs';
import {OverseerImage, OverseerImageService} from 'src/app/api/models/doubtfire-model';
import {EntityFormComponent} from 'src/app/common/entity-form/entity-form.component';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import API_URL from 'src/app/config/constants/apiUrl';

@Component({
  selector: 'overseer-image-list',
  templateUrl: 'overseer-image-list.component.html',
  styleUrls: ['overseer-image-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class OverseerImageListComponent
  extends EntityFormComponent<OverseerImage>
  implements AfterViewInit
{
  @ViewChild('textDialog') textDialog!: TemplateRef<object>;

  @ViewChild(MatTable, {static: true}) table: MatTable<OverseerImage>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  // Set up the table
  columns: string[] = ['name', 'tag', 'pull', 'last-pulled', 'status', 'options'];
  overseerImages: OverseerImage[] = new Array<OverseerImage>();
  dataSource = new MatTableDataSource(this.overseerImages);
  loading = false;
  loadingImages = true;
  skeletonRows = Array.from({length: 2}, (_, index) => index);

  public diskSpace: number | null = null;

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    private overseerImageService: OverseerImageService,
    private alerts: AlertService,
    private dialog: MatDialog,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private httpClient: HttpClient,
  ) {
    super(
      {
        name: new UntypedFormControl('', [Validators.required]),
        tag: new UntypedFormControl('', [Validators.required]),
      },
      'Overseer Image',
    );
  }

  ngAfterViewInit() {
    // Get all the overseer images and add them to the table
    this.loadingImages = true;
    this.overseerImageService
      .fetchAll()
      .pipe(finalize(() => (this.loadingImages = false)))
      .subscribe((response) => {
        this.pushToTable(response);
      });

    this.httpClient.get<number>(`${API_URL}/admin/disk_space`).subscribe({
      next: (diskSpace) => {
        this.diskSpace = diskSpace;
      },
    });
  }

  // This method is passed to the submit method on the parent
  // and is only run when an entity is successfully created or updated
  onSuccess(response: OverseerImage, isNew: boolean) {
    if (isNew) {
      this.pushToTable(response);
    }
  }

  // Push the values that will be displayed in the table
  // to the datasource
  private pushToTable(value: OverseerImage | OverseerImage[]) {
    if (!value) {
      return;
    }
    if (value instanceof Array) {
      this.overseerImages.push(...value);
    } else {
      this.overseerImages.push(value);
    }
    this.dataSource.sort = this.sort;
  }

  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.overseerImageService, this.alerts, this.onSuccess.bind(this));
  }

  // This method is called when pull button is clicked to pull overseer image.
  pullOverseerImage(image: OverseerImage) {
    this.loading = true;
    image.pulledImageStatus = 'loading';
    this.overseerImageService.pullDockerImage(image).subscribe((job) => {
      this.sidekiqProgressModalService
        .show(`Pulling image ${image.name} (${image.tag})`, job.id)
        .subscribe((_job) => {
          this.overseerImageService.fetch(image.id).subscribe((newImage) => {
            console.log(newImage);
            this.loading = false;
          });
        });
    });
  }

  deleteOverseerImage(image: OverseerImage) {
    this.overseerImageService.delete(image).subscribe(
      ((_response) => {
        this.cancelEdit();
        this.overseerImages.splice(this.overseerImages.indexOf(image), 1);
        this.dataSource.data = this.overseerImages;
      }).bind(this),
    );
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    switch (sort.active) {
      case 'name':
      case 'tag':
        return super.sortTableData(sort);
    }
  }

  public showDialog(image: OverseerImage) {
    this.dialog.open(this.textDialog, {
      data: {text: image.pulledImageText},
    });
  }
}
