import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { interval, switchMap } from 'rxjs';
import { iteratee } from 'lodash';

@Component({
  selector: 'app-welcome-wizard',
  templateUrl: './welcome-wizard.component.html',
  styleUrls: ['./welcome-wizard.component.scss'],
})
export class WelcomeWizardComponent implements OnInit {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  constructor(private _formBuilder: FormBuilder, private constants: DoubtfireConstants) {}

  public externalName = this.constants.ExternalName;
  public gradientObject = { val: 0 };

  ngOnInit(): void {
    interval(12000).subscribe(
      (_) => (this.gradientObject.val = this.gradientObject.val < 1 ? this.gradientObject.val + 1 : 0)
    );
  }
}
