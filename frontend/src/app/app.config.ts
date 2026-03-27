import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Angulartics2Module, Angulartics2GoogleGlobalSiteTag } from 'angulartics2';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { CanActivateAuthPage, CanActivateUnAuthPage } from './guards/auth/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { apiBaseUrlInterceptor } from './interceptors/base-url.interceptor';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, 'assets/i18n/', '.json');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 3000,
      },
    },
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, AuthInterceptor])),
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
    },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    CanActivateAuthPage,
    CanActivateUnAuthPage,
    TranslatePipe,
    importProvidersFrom([
      Angulartics2Module.forRoot({
        gst: {
          trackingIds: [environment.gaId],
        },
      }),
    ]),
    Angulartics2GoogleGlobalSiteTag,
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ]),
    // TranslatePipe,
    // provideClientHydration(
    //   withEventReplay(),
    //   withHttpTransferCacheOptions({
    //     includeRequestsWithAuthHeaders: true,
    //   }),
    // ),
  ],
};
