import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GaEventName } from 'app/constants/ga-event';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService, NOT_INITIAL_USER } from 'app/services/auth.service';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [RouterModule, TranslateModule],
})
export class FooterComponent {
  now = new Date();

  authService = inject(AuthService);
  analyticsService = inject(AnalyticsService);

  isAuth = toSignal(
    this.authService.user$.pipe(
      filter((user) => user !== NOT_INITIAL_USER),
      map((user) => !!user),
    ),
  );

  viewResources(event?: MouseEvent) {
    event?.stopPropagation();
    event?.preventDefault();
    this.analyticsService.trackEvent(GaEventName.SELECT_CONTENT, {
      content_type: 'resources',
    });
    window.open('https://www.wastetrade.com/resources', '_blank');
  }
}
