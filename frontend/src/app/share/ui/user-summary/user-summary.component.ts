import { Component, Input, OnInit } from '@angular/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';

@Component({
  selector: 'app-user-summary',
  templateUrl: './user-summary.component.html',
  styleUrls: ['./user-summary.component.scss'],
})
export class UserSummaryComponent implements OnInit {
  @Input() userData: any;
  @Input() allowDetails: boolean = false;

  constructor() {}

  ngOnInit() {}

  viewUserDetails() {
    const userId = this.userData?.id;
    if (!userId) {
      return;
    }
    window.open(`${ROUTES_WITH_SLASH.adminMemberDetail}/${userId}`, '_blank');
  }
}
