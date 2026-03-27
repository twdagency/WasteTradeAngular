import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AccountStatusWarningComponent } from '../../share/ui/account-status-warning/account-status-warning.component';
import { AvatarComponent } from '../common/avatar/avatar.component';
import { IconComponent } from '../common/icon/icon.component';
import { LanguageSelectorComponent } from '../common/language-selector/language-selector.component';
import { NotificationComponent } from '../common/notification/notification.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-common-layout',
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
  templateUrl: './common-layout.component.html',
  styleUrl: './common-layout.component.scss',
})
export class CommonLayoutComponent {
  @Input({ required: true }) title: string = '';

  readonly ROUTES_WITH_SLASH = ROUTES_WITH_SLASH;
}
