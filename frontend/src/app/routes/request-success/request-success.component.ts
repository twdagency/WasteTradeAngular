import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { AuthService } from 'app/services/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-request-success',
  template: `
    <app-un-auth-layout>
      @if (role(); as role) {
        <div class="success-content">
          <div class="wrapper">
            <div class="announcement-card">
              <div class="icon-wrapper">
                <svg width="87" height="87" viewBox="0 0 87 87" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="43.5" cy="43.5" r="43" fill="#E5F6F0" stroke="white" />
                  <path d="M40 56H48V64H40V56Z" fill="#06985C" />
                  <path d="M40 23H48V48H40V23Z" fill="#06985C" />
                </svg>
              </div>

              <h2 class="announcement-title">{{ 'Announcement' | translate }}</h2>

              <div class="announcement-content">
                @if (role === 'trader') {
                  <p class="mb-0">
                    {{
                      'Your join request has been sent for review. You will receive an email once the company administrator makes a decision.'
                        | translate
                    }}
                  </p>

                  <p class="mb-0">
                    {{
                      'You can now log in to WasteTrade, but your account will remain incomplete until your onboarding is finished. Any information entered in steps 2 and 3 may be overwritten if the company administrator approves your request. A rejection will not affect any existing information on your profile.'
                        | translate
                    }}
                  </p>
                }

                @if (role === 'haulier') {
                  <p class="mb-0">
                    {{
                      'Your join request has been sent for review. You will receive an email once the company administrator makes a decision.'
                        | translate
                    }}
                  </p>

                  <p class="mb-0">
                    {{
                      'Your account will become active only after your request is approved. If your request is rejected, you will need to complete the registration process again.'
                        | translate
                    }}
                  </p>
                }
              </div>

              <button mat-flat-button class="understand-button" (click)="goToLogin()">
                {{ 'I UNDERSTAND' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-un-auth-layout>
  `,
  styleUrls: ['./request-success.scss'],
  imports: [MatButtonModule, MatIconModule, TranslateModule, UnAuthLayoutComponent],
})
export class RequestSuccessComponent {
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);

  goToLogin(): void {
    this.authService.logout();
  }

  role = toSignal(
    this.activatedRoute.data.pipe(
      map((data) => {
        return data['role'];
      }),
    ),
  );
}
