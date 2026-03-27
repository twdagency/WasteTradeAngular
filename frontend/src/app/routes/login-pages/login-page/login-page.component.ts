import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { UnAuthLayoutComponent } from 'app/layout/un-auth-layout/un-auth-layout.component';
import { SeoService } from 'app/services/seo.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { LoginComponent } from '../login/login.component';
import { SetPasswordComponent } from '../set-password/set-password.component';

type ComponentName = 'login' | 'forgot-password' | 'set-password';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [CommonModule, ForgotPasswordComponent, LoginComponent, SetPasswordComponent, UnAuthLayoutComponent],
})
export class LoginPageComponent implements OnInit {
  contentName = signal<ComponentName | undefined>(undefined);
  seoService = inject(SeoService);
  translate = inject(TranslatePipe);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['lost_pass'] === '1') {
        this.contentName.set('forgot-password');
      } else if (params['reset_pass'] === '1') {
        this.contentName.set('set-password');
      } else {
        this.contentName.set('login');
      }
    });

    this.seoService.updateMetaTags({
      title: this.translate.transform(localized$('Login')),
      description: this.translate.transform(
        localized$(
          'WasteTrade is the global platform for trading in waste commodities. WasteTrade has partnered with the artificial intelligence tool. Login now!',
        ),
      ),
    });
  }
}
