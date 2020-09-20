import { OnInit, Directive } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Entity } from 'src/app/api/models/entity';
import { EntityService, HttpOptions } from 'src/app/api/models/entity.service';
import { Observable } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export type OnSuccessMethod<T> = (object: T, isNew: boolean) => void;

@Directive()
export class EntityFormComponent<T extends Entity> implements OnInit {
  // formData consists of the various FormControl elements that the form is made up of.
  // See FormGroup:     https://angular.io/api/forms/FormGroup
  // See FormControl:   https://angular.io/api/forms/FormControl
  formData: FormGroup;

  // selected references a value that is being edited in the form
  // See CampusListComponent for reference to usecase of selected
  selected: T;

  // defaultFormGroup specifies what default values the form should be reset to.
  // These default values are specified in classes that extend EntityFormComponent
  // when the FormControls are instansiated - defaults are then assigned in the constructor
  defaultFormData = {};

  // backup is required in the event that an update on a value populated in the form
  // fails (server rejects the update) - in the event of failure, the backup can be used
  // to restore the appropriate data.
  backup = {};

  // serves as a mapped set of functions that may be required to perform
  // some kind of data manipulation on the data contained within the form
  // before being sent off to the serve. For instance, unit-tutorials-list.component
  // is designed to create and edit Tutorials, where a tutorial has exaclty one Tutor (object)
  // and one Campus (object). When sending a Tutorial to the server, it expects not to recieve those
  // particular entities as objects, but rather their unique ids that denote those instances.
  // Before a Tutorial is sent to the server, a tutorial's tutor needs to be mapped as { tutor_id: x }
  // and the same with campus as { campus_id: y }.
  // See unit-tutorials-list.component
  formDataMapping = {};

  dataSource: MatTableDataSource<T>;

  /**
   * Create a new instance of EntityFormComponent.
   *
   * @param controls the FormControls that will make up the form.
   */
  constructor(controls: { [key: string]: AbstractControl }) {
    this.formData = new FormGroup(controls);
    // Iterate over the FormControls passed in and assign the default values
    // For each based on the values that they are constructed with
    for (const key of Object.keys(this.formData.controls)) {
      this.defaultFormData[key] = this.formData.get(`${key}`).value;
    }
  }

  ngOnInit() {}

  /**
   * Cancel edit of current selected value.
   */
  cancelEdit() {
    this.formData.reset(this.defaultFormData);
    this.selected = null;
  }

  /**
   * Mark @param resource for edit, which copies the data of resource
   * to the respective FormControl elements.
   *
   * @param resource the value to be edited in the form.
   */
  flagEdit(resource: T) {
    this.selected = resource;
    this.copyResourceToForm();
  }

  /**
   * Has there been any changes to the value that is currently being edited.
   *
   * @returns whether or not changes have been made.
   */
  hasChanges(): boolean {
    // We have the @property selected to keep track of a value
    // that a user may edit. Once a value has been selected for edit,
    // we need to be able to determine whether changes have been made to
    // that value - this way, we only need to post to the server when we
    // know changes have been made.
    for (const key of Object.keys(this.formData.controls)) {
      if (this.selected[key] !== this.formData.get(`${key}`).value) {
        return true;
      }
    }
    return false;
  }

  /**
   * Submit the form data to the server and create or update an entity
   * based on the form's state. A new entity will be created if there is
   * currently no value being edited.
   *
   * @param service the entity service used to perform CRUD for the entity.
   * @param alertService the alert service used to provide alerts.
   * @param success the function, provided by inheritor, that is executed on success of CRUD methods.
   */
  submit(service: EntityService<T>, alertService: any, success: OnSuccessMethod<T>) {
    // response is what we get back from the server
    // when creating or updating
    let response: Observable<T>;

    // Let's first check to see if the data in the form is valid.
    // Note: Validations are specified when the FormControl elements for a form
    // are instantiated.
    // See form validatoin:   https://angular.io/guide/form-validation
    // See CampusListComponent for reference to use of FormControls and validations
    if (this.formData.valid) {
      // If there is a selected value and there are changes made to that value
      // then the form is being used to edit data, which means we'll want to update
      // rather than create
      if (this.selected && this.hasChanges()) {
        // Copy the changes from the form to the data that will be sent to the server
        // Then send it off
        this.copyChangesFromForm();
        response = service.update(this.selected);
      } else if (!this.selected) {
        // Nothing selected, which means we're creating something new
        response = service.create(this.formDataToNewObject(service.serverKey));
      } else {
        // Nothing has changed if the selected value, so we want to inform the user
        alertService.add('danger', `${service.entityName} was not changed`, 6000);
        return;
      }

      // Handle the response
      response.subscribe(
        (result: T) => {
          alertService.add('success', `${service.entityName} saved`, 2000);
          // Success is implemented on all inheriting instances and is used
          // to handle the response appropriately for the context of the form
          success(result, this.selected ? false : true);
          // If we were editing, set select to null and reset the backup
          if (this.selected) {
            this.selected = null;
            this.backup = {};
          }
          // Reset the form to default values
          this.formData.reset(this.defaultFormData);
        },
        (error) => {
          // Whoops - an error
          // Restore the form data from backup if applicable
          if (this.selected) {
            this.restoreFromBackup();
          }
          alertService.add('danger', `${service.entityName} save failed: ${error}`, 6000);
        }
      );
    } else {
      // Once we mark forms as touched, erroneous state will be rendered
      // In the form's template accordingly
      this.formData.markAllAsTouched();
    }
  }
  /**
   * Get changes denoted by key, in which differences in data between
   * the FormControls and the selected value are returned.
   *
   * @returns mapping of any changes made
   */
  getFormDataChanges(): object {
    const changes = {};
    for (const key of Object.keys(this.formData.controls)) {
      if (this.selected[key] !== this.formData.get(`${key}`).value) {
        changes[key] = this.formData.get(`${key}`).value;
      }
    }
    return changes;
  }

  /**
   * Copy changes in data related to the FromControls into
   * the selected value. This is called in preperation to send
   * data to the server.
   */
  copyChangesFromForm() {
    const changes = this.getFormDataChanges();
    for (const key of Object.keys(changes)) {
      this.backup[key] = this.selected[key];
      this.selected[key] = changes[key];
    }
  }

  /**
   * Copy a resource's data to the related FormControls. This prepares the form
   * for the event in which data may be edited.
   */
  copyResourceToForm() {
    for (const key of Object.keys(this.selected)) {
      // We need to check to see that the form has FormControls
      // that match the key of the selected value. For instance,
      // a resource may have an id, which is generally only related to
      // the model on the back end - rarely, if at all, displayed to the user.
      if (this.formData.get(`${key}`)) {
        this.formData.get(`${key}`).setValue(this.selected[key]);
      }
    }
  }

  /**
   * Get the values within the form's FormControls as an object. This
   * prepares the form's inputs to be sent off to the server in order to
   * create a new entity.
   *
   * @param endPointKey identifies the type of data the server will receive.
   *
   * @returns object representation of form data.
   */
  protected formDataToNewObject(endPointKey: string): object {
    const result = {};
    result[endPointKey] = {};
    for (const key of Object.keys(this.formData.controls)) {
      result[endPointKey][key] = this.formData.get(`${key}`).value;
    }
    return result;
  }

  /**
   * Copy the values from the backup into the selected
   * form value. This will occur if an update fails,
   * preserving any data that existed before the update was triggered.
   */
  private restoreFromBackup() {
    for (const key of Object.keys(this.backup)) {
      this.selected[key] = this.backup[key];
    }
  }

  /**
   * Check to see if the provided resource is that one being edited.
   *
   * @param resource the value to be compared against the current selection.
   *
   * @returns whether or not the provided resource is being edited.
   */
  editing(resource): boolean {
    return this.selected === resource;
  }

  /**
   * Function to implement custom sorting on implementors of EntityForm.
   * You will be required to implement this method on inheritors when
   * the data within the EntityForm contains properties whose values
   * are objects. See unit-tutorial-list.ts for implementation.
   *
   * @param sort the event received when sorting has been triggered.
   */
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      return this.sortCompare(a[sort.active], b[sort.active], isAsc);
    });
  }

  /**
   * Function used by implemented sortTableData to determine the order
   * of values within the EntityForm once sorting has been triggered.
   *
   * @param aValue value to be compared against bValue.
   * @param bValue value to be compared against aValue.
   *
   * @returns truthy comparison between aValue and bValue.
   */
  protected sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
