import { Component } from '@angular/core';
import { StateService } from '@uirouter/core';
import _ from 'lodash';
import { Observable, ReplaySubject, take } from 'rxjs';
import { UserService } from 'src/app/api/models/doubtfire-model';
import { TiiService } from 'src/app/api/services/tii.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-accept-eula',
  templateUrl: './accept-eula.component.html',
  styleUrls: ['./accept-eula.component.scss'],
})
export class AcceptEulaComponent {
  public toolName: Observable<string>;
  public eulaHtml: string;

  public iframeDoc$ = new ReplaySubject<any>(1);

  constructor(
    private constants: DoubtfireConstants,
    private tiiService: TiiService,
    private userService: UserService,
    private alertService: AlertService,
    private state: StateService
  ) {
    this.constants.IsTiiEnabled.subscribe((enabled) => {
      if (enabled) {
        this.getEulaHtml();
      } else {
        this.state.go('home');
      }
    });

    this.toolName = constants.ExternalName;
  }

  public getEulaHtml() {
    this.tiiService.getTiiEula().subscribe((eulaHtml) => {
      this.eulaHtml = eulaHtml;
      this.yourFunctionForChangingHTML();
    });
  }

  public acceptEula(): void {
    this.userService.currentUser.acceptTiiEula().subscribe(() => {
      this.alertService.success('You have accepted the EULAs');
      this.state.go('home');
    });
  }

  public onIframeLoad(iframe): void {
    this.iframeDoc$.next(iframe.contentDocument || iframe.contentWindow);
  }

  getIframeDoc(): Observable<any> {
    return this.iframeDoc$.asObservable();
  }

  yourFunctionForChangingHTML(): void {
    this.getIframeDoc()
      .pipe(take(1))
      .subscribe((iframeDoc) => {
        iframeDoc.open();
        iframeDoc.write(this.eulaHtml);
      });
  }
}
