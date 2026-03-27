import { Component, OnInit } from '@angular/core';
import { AccountOnboardingStatusComponent } from '@app/ui';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';

@Component({
  selector: 'app-registration-complete-result',
  templateUrl: './registration-complete-result.component.html',
  imports: [
    AccountOnboardingStatusComponent,
    UnAuthLayoutComponent
  ]
})
export class RegistrationCompleteResultComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
