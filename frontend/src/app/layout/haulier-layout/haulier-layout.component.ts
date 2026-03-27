import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AccountStatusWarningComponent } from 'app/share/ui/account-status-warning/account-status-warning.component';
import { AvatarComponent } from '../common/avatar/avatar.component';
import { IconComponent } from '../common/icon/icon.component';
import { LanguageSelectorComponent } from '../common/language-selector/language-selector.component';
import { NotificationComponent } from '../common/notification/notification.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-haulier-layout',
  templateUrl: './haulier-layout.component.html',
  styleUrls: ['./haulier-layout.component.scss'],
  imports: [
    FooterComponent,
    HeaderComponent,
    MatIconModule,
    IconComponent,
    AvatarComponent,
    NotificationComponent,
    LanguageSelectorComponent,
    RouterModule,
    AccountStatusWarningComponent,
    TranslateModule,
  ],
})
export class HaulierLayoutComponent implements OnInit {
  @Input({ required: true }) title: string = '';

  constructor() {}

  ngOnInit() {}
}
