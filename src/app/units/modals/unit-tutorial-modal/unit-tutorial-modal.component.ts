import {RequestOptions} from 'ngx-entity-service';
import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {
  Campus,
  CampusService,
  Tutorial,
  TutorialService,
  TutorialStream,
  Unit,
  User,
} from 'src/app/api/models/doubtfire-model';
import {EntityFormComponent} from 'src/app/common/entity-form/entity-form.component';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

// Default duration for a new tutorial, in minutes (2 hours).
const DEFAULT_TUTORIAL_DURATION_MINUTES = 120;

@Component({
  selector: 'f-unit-tutorial-modal',
  templateUrl: 'unit-tutorial-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitTutorialModalComponent extends EntityFormComponent<Tutorial> implements OnInit {
  unit: Unit;
  stream: TutorialStream;
  campuses: Campus[] = new Array<Campus>();

  days: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Asynchronous',
  ];

  constructor(
    public dialogRef: MatDialogRef<UnitTutorialModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {unit: Unit; stream?: TutorialStream; tutorial?: Tutorial},
    private tutorialService: TutorialService,
    private campusService: CampusService,
    private alerts: AlertService,
    private confirmationModal: ConfirmationModalService,
  ) {
    super(
      {
        meetingDay: new UntypedFormControl('', [Validators.required]),
        meetingTime: new UntypedFormControl(null, [Validators.required]),
        meetingLocation: new UntypedFormControl('', [Validators.required]),
        abbreviation: new UntypedFormControl('', [Validators.required]),
        campus: new UntypedFormControl(null, []),
        capacity: new UntypedFormControl('', [Validators.required]),
        durationMinutes: new UntypedFormControl(DEFAULT_TUTORIAL_DURATION_MINUTES, [
          Validators.required,
          Validators.min(1),
        ]),
        tutor: new UntypedFormControl(null, [Validators.required]),
      },
      'Tutorial',
    );
  }

  ngOnInit(): void {
    this.unit = this.data.unit;
    this.stream = this.data.stream;
    if (this.data.tutorial) {
      this.flagEdit(this.data.tutorial);
    }

    this.campusService.query().subscribe((campuses) => {
      this.campuses.push(...campuses);
    });
  }

  public get streamName(): string {
    return this.stream ? `${this.stream.name} - ${this.stream.abbreviation}` : 'No stream';
  }

  public get isEditing(): boolean {
    return !!this.selected;
  }

  submit(): void {
    super.submit(this.tutorialService, this.alerts, () => this.dialogRef.close());
  }

  deleteTutorial(): void {
    const tutorial = this.selected;
    this.confirmationModal.show(
      `Delete Tutorial ${tutorial.abbreviation}`,
      'Are you sure you want to delete this tutorial?',
      () =>
        this.tutorialService.delete(tutorial, this.optionsOnRequest('delete')).subscribe({
          next: () => {
            this.alerts.success('Tutorial deleted', 2000);
            this.dialogRef.close();
          },
          error: (message: string) => {
            this.alerts.error(message || 'Unable to delete tutorial', 8000);
          },
        }),
    );
  }

  protected formDataToNewObject(endPointKey: string): object {
    this.selected = new Tutorial(this.unit);
    this.copyChangesFromForm();
    this.selected.tutorialStream = this.stream;
    super.formDataToNewObject(endPointKey);
    return this.selected;
  }

  /**
   * Ensure that the unit is passed to the Tutorial entity when create is called, and that the new
   * tutorial lands in the unit's cache so the list behind the modal picks it up.
   */
  protected override optionsOnRequest(
    _kind: 'create' | 'update' | 'delete',
  ): RequestOptions<Tutorial> {
    return {
      constructorParams: this.unit,
      cache: this.unit.tutorialsCache,
    };
  }

  // Required to match the selected campus and tutor against the option values.
  // See: https://angular.io/api/forms/SelectControlValueAccessor
  compareSelection(aEntity: User | Campus | {user_id: number}, bEntity: User | Campus) {
    if (!aEntity || !bEntity) {
      return;
    }
    if (bEntity instanceof User) {
      // The form control holds a User, while some payloads supply {user_id} - accept either.
      if ('user_id' in aEntity) {
        return aEntity.user_id === bEntity.id;
      }
      return aEntity.id === bEntity.id;
    } else {
      return 'id' in aEntity && aEntity.id === bEntity.id;
    }
  }
}
