import { Component, Input, Inject } from '@angular/core';
import { currentUser } from 'src/app/ajs-upgraded-providers';
import { CheckIn, CheckInService, Project, Tutorial } from 'src/app/api/models/doubtfire-model';
import { OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { StateService, TransitionService, UIRouterGlobals } from '@uirouter/angular';

@Component({
  selector: 'io-track',
  templateUrl: './iotrack.component.html',
  styleUrls: ['./iotrack.component.scss'],
})
export class IOTrackComponent implements OnInit {
  @Input() unit: any;
  private _selectedTutorial: Tutorial = null;
  public checkins: CheckIn[] = [];
  public control = new FormControl();
  public filteredStudents: Observable<string[]>;

  constructor(
    @Inject(currentUser) private currentUserRef: any,
    private checkInService: CheckInService,
    private stateService: StateService,
    private uiRouterGlobals: UIRouterGlobals,
    private transitionService: TransitionService
  ) {
    // TODO: doesn't work on initial load
    transitionService.onFinish({}, (transition) => {
      this._selectedTutorial = this.unit.tutorials.find((tutorial) => {
        return tutorial.id === transition.targetState().params().tutorial;
      });

      this.checkInService
        .query({}, this.unit, { params: { room_number: this._selectedTutorial.meeting_location } })
        .subscribe((records) => {
          this.checkins = records;
        });
    });
  }

  ngOnInit() {
    this.filteredStudents = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: any): string[] {
    const filterValue = value.toLowerCase().replace(/\s/g, '');
    return this._selectedTutorial.students.filter((user) => this._normalizeValue(user).includes(filterValue));
  }

  private _normalizeValue(value: any): string {
    if (!value) return value;
    return value.name.toLowerCase().replace(/\s/g, '');
  }

  updateTutorial(tutorial: Tutorial): void {
    this.stateService.go(this.uiRouterGlobals.current, { tutorial: tutorial.id }, { notify: false });
  }

  refreshCheckins(): void {
    if (!this._selectedTutorial) throw Error('A tutorial needs to be selected first');
    this.checkInService
      .query({}, this.unit, { params: { room_number: this._selectedTutorial.meeting_location } })
      .subscribe((records) => {
        this.checkins = records;
      });
  }

  assignUserToIdCard(checkin: CheckIn, user: Project) {
    checkin.assignUserToIdCard(user).subscribe((resposnse) => {
      console.log('Checkin updated');
    });
  }

  userSelected(user: Project, checkin: CheckIn) {
    this.assignUserToIdCard(checkin, user);
  }

  checkout(checkin: CheckIn) {
    checkin.checkout().subscribe((_) => {});
  }

  checkoutEveryone(tutorial: Tutorial) {
    CheckIn.checkoutEveryone(tutorial, tutorial.meeting_location).subscribe((_) => {
      this.refreshCheckins();
    });
  }

  public get selectedTutorial(): Tutorial {
    return this._selectedTutorial;
  }
}
