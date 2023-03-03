import { Component, Inject, ViewChild } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { OverseerImage, OverseerImageService } from 'src/app/api/models/doubtfire-model';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'overseer-image-list',
  templateUrl: 'overseer-image-list.component.html',
  styleUrls: ['overseer-image-list.component.scss'],
})
export class OverseerImageListComponent extends EntityFormComponent<OverseerImage> {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Set up the table
  columns: string[] = ['name', 'tag', 'options'];
  overseerImages: OverseerImage[] = new Array<OverseerImage>();
  dataSource = new MatTableDataSource(this.overseerImages);

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(private overseerImageService: OverseerImageService, @Inject(alertService) private alerts: any) {
    super({
      name: new UntypedFormControl('', [Validators.required]),
      tag: new UntypedFormControl('', [Validators.required]),
    }, "Overseer Image");
  }

  ngAfterViewInit() {
    // Get all the activity types and add them to the table
    this.overseerImageService.query().subscribe((response) => {
      this.pushToTable(response);
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
    if (!value) return;
    value instanceof Array ? this.overseerImages.push(...value) : this.overseerImages.push(value);
    this.dataSource.sort = this.sort;
  }

  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.overseerImageService, this.alerts, this.onSuccess.bind(this));
  }

  deleteOverseerImage(image: OverseerImage) {
    this.overseerImageService.delete(image).subscribe( ((response) => {
      this.cancelEdit();
      this.overseerImages.splice(this.overseerImages.indexOf(image), 1);
      this.dataSource.data = this.overseerImages;
    }).bind(this));
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
}
