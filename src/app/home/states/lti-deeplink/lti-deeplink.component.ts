import {AfterViewInit, Component, Input} from '@angular/core';
import {StateService} from '@uirouter/core';
import {CreateNewUnitModal} from 'src/app/admin/modals/create-new-unit-modal/create-new-unit-modal.component';
import {Unit} from 'src/app/api/models/unit';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {LtiService} from 'src/app/api/services/lti.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {UserService} from 'src/app/api/services/user.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-lti-deeplink',
  templateUrl: 'lti-deeplink.component.html',
  styleUrls: ['lti-deeplink.component.scss'],
})
export class LtiDeeplinkComponent implements AfterViewInit {
  constructor(
    private createUnitModalService: CreateNewUnitModal,
    private unitService: UnitService,
    private authenticationService: AuthenticationService,
    private confirmationModalService: ConfirmationModalService,
    private alertsService: AlertService,
    private ltiService: LtiService,
    private userService: UserService,
    private stateService: StateService,
  ) {}

  @Input() ltik: string;

  public selectedUnit: Unit;
  public activeUnits: Unit[] = [];

  public unitLinked: boolean = false;

  public loadingUnits: boolean;

  ngAfterViewInit(): void {
    this.loadingUnits = true;

    // Scroll to the bottom of the page in case the header is visible
    // Ensures our action buttons are centered
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);

    this.authenticationService.afterAuthCall(() => {
      this.userService.currentUser.ltik = this.ltik;
      this.loadUnits();
    });

    // TODO: query our LTI API to see if we have already linked a unit
  }

  public submit(): void {
    this.confirmationModalService.show(
      `Are you sure you want to link ${this.selectedUnit.code} to ${'Moodle-Name-Here'}?`,
      'Once you have linked an OnTrack unit, students who launch this app will be enrolled automatically. Unlinking a unit will not withdraw students automatically.',
      () => {
        // Trigger API call to LTI.js with our deeplink request
        console.log('Trigger API call to LTI.js');
        this.linkUnit(this.selectedUnit);
      },
    );
  }

  private async linkUnit(unit: Unit) {
    this.ltiService
      .setUnitLink({
        unitId: unit.id.toString(),
        // unitCode: unit.code,
        // unitName: unit.name,
      })
      .subscribe({
        next: (link) => {
          console.log(link);

          this.alertsService.success(`Successfully linked ${unit.code}`, 5000);

          this.stateService.go('lti', {
            ltik: this.ltik,
          });
        },
        error: (error) => {
          console.log(error);
          this.alertsService.error(`Failed to link unit: ${error.error}`, 6000);
        },
      });
  }

  public loadUnits(): void {
    // Load units that current user is a convenor/admin of
    this.unitService
      .fetchAll(
        {},
        {
          params: {
            include_in_active: true,
          },
        },
      )
      .subscribe({
        next: (units) => {
          this.activeUnits = [...units];
          this.loadingUnits = false;
        },
        error: (error) => {
          this.alertsService.error(`Failed to fetch units`, 6000);
        },
      });
  }
}
