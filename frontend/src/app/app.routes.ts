import { Routes } from '@angular/router';
import { ROUTES } from './constants/route.const';
import { CanActivateAuthPage, CanActivateUnAuthPage } from './guards/auth/auth.guard';
import {} from './guards/auth/utils';
import { CompanyAdminGuard } from './guards/company-admin.guard';
import { CompanyRoleGuard } from './guards/company-role.guard';
import { AccountSettingComponent } from './routes/account-setting/account-setting.component';
import { CommercialManagementComponent } from './routes/admin/commercial-management/commercial-management.component';
import { LiveActiveTableComponent } from './routes/admin/live-active-table/live-active-table.component';
import { CreateListingComponent } from './routes/create-listing/create-listing.component';
import { LogoutComponent } from './routes/logout/logout.component';
import { MySitesComponent } from './routes/my-sites/my-sites.component';
import { PrivacyComponent } from './routes/privacy/privacy.component';
import { CompanyDocumentComponent } from './routes/registrations/company-document/company-document.component';
import { CompanyInformationSectionComponent } from './routes/registrations/company-information-section/company-information-section.component';
import { HaulageFormComponent } from './routes/registrations/haulage-form/haulage-form.component';
import { RegistrationCompleteResultComponent } from './routes/registrations/registration-complete-result/registration-complete-result.component';
import { RegistrationPendingResultComponent } from './routes/registrations/registration-pending-result/registration-pending-result.component';
import { SiteLocationSectionComponent } from './routes/registrations/site-location-section/site-location-section.component';
import { TradingFlatformFormComponent } from './routes/registrations/trading-flatform-form/trading-flatform-form.component';
import { TermComponent } from './routes/term/term.component';
import { GuardRequireRole } from './types/auth';
import { CompanyUserRequestRoleEnum } from './types/requests/company-user-request';

const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./routes/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: ROUTES.login,
    canActivate: [CanActivateUnAuthPage],
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    loadComponent: () =>
      import('./routes/login-pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: 'termsandconditions',
    component: TermComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyComponent,
  },
  {
    canActivate: [CanActivateUnAuthPage],
    path: 'create-account',
    component: TradingFlatformFormComponent,
  },
  {
    canActivate: [CanActivateUnAuthPage],
    path: 'create-haulier-account',
    component: HaulageFormComponent,
  },
  {
    canActivate: [CanActivateAuthPage],
    path: 'complete-your-account',
    component: RegistrationPendingResultComponent,
  },
  {
    canActivate: [CanActivateAuthPage],
    path: 'account-complete-result',
    component: RegistrationCompleteResultComponent,
  },
  {
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
    },
    path: 'company-information',
    component: CompanyInformationSectionComponent,
  },
  {
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
    },
    path: 'company-document',
    component: CompanyDocumentComponent,
  },
  {
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
    },
    path: 'site-location',
    component: SiteLocationSectionComponent,
  },
  {
    path: 'resume',
    loadComponent: () => import('./routes/resume/resume.component').then((m) => m.ResumeComponent),
  },
  {
    path: ROUTES.buy,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
    },
    loadComponent: () => import('./routes/market-place/market-place.component').then((m) => m.MarketPlaceComponent),
  },
  {
    path: ROUTES.wanted,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
    },
    loadComponent: () =>
      import('./routes/wanted-material/wanted-material.component').then((m) => m.WantedMaterialComponent),
  },
  {
    path: ROUTES.saleListings,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
      listingType: 'sell',
      requireCompanyRole: [
        CompanyUserRequestRoleEnum.ADMIN,
        CompanyUserRequestRoleEnum.BOTH,
        CompanyUserRequestRoleEnum.SELLER,
      ],
    },
    loadComponent: () => import('./routes/sale-listing/sale-listing.component').then((m) => m.SaleListingComponent),
  },
  {
    path: ROUTES.wantedListings,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
      listingType: 'wanted',
      requireCompanyRole: [
        CompanyUserRequestRoleEnum.ADMIN,
        CompanyUserRequestRoleEnum.BOTH,
        CompanyUserRequestRoleEnum.BUYER,
      ],
    },
    loadComponent: () => import('./routes/sale-listing/sale-listing.component').then((m) => m.SaleListingComponent),
  },
  {
    path: ROUTES.sell,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
      requireCompanyRole: [
        CompanyUserRequestRoleEnum.ADMIN,
        CompanyUserRequestRoleEnum.BOTH,
        CompanyUserRequestRoleEnum.SELLER,
      ],
    },
    component: CreateListingComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: {
          type: 'sell',
          mode: 'create',
        },
        loadComponent: () =>
          import('./routes/create-listing/sell-lising-material-form/sell-lising-material-form.component').then(
            (m) => m.SellLisingMaterialFormComponent,
          ),
      },
      {
        path: ':id/edit',
        data: {
          type: 'sell',
          mode: 'edit',
        },
        loadComponent: () =>
          import('./routes/create-listing/sell-lising-material-form/sell-lising-material-form.component').then(
            (m) => m.SellLisingMaterialFormComponent,
          ),
      },
    ],
  },
  {
    path: ROUTES.createWantedListing,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading],
      requireCompanyRole: [
        CompanyUserRequestRoleEnum.ADMIN,
        CompanyUserRequestRoleEnum.BOTH,
        CompanyUserRequestRoleEnum.BUYER,
      ],
    },
    component: CreateListingComponent,
    children: [
      {
        path: '',
        data: {
          type: 'wanted',
        },
        loadComponent: () =>
          import('./routes/create-listing/list-wanted-material-form/list-wanted-material-form.component').then(
            (m) => m.ListWantedMaterialFormComponent,
          ),
      },
    ],
  },
  {
    path: ROUTES.availableLoads,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin, GuardRequireRole.Haulier],
    },
    loadComponent: () =>
      import('./routes/haulier/available-loads/available-loads.component').then((m) => m.AvailableLoadsComponent),
  },
  {
    path: `${ROUTES.makeOffer}`,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin, GuardRequireRole.Haulier],
    },
    loadComponent: () => import('./routes/haulier/make-offer/make-offer.component').then((m) => m.MakeOfferComponent),
  },
  {
    path: ROUTES.haulierOffer,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin, GuardRequireRole.Haulier],
    },
    loadComponent: () =>
      import('./routes/haulier/current-offers/current-offers.component').then((m) => m.CurrentOffersComponent),
  },
  {
    path: ROUTES.haulierProfile,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin, GuardRequireRole.Haulier],
    },
    loadComponent: () =>
      import('./routes/haulier/haulier-profile/haulier-profile.component').then((m) => m.HaulierProfileComponent),
  },
  {
    path: `${ROUTES.haulierOffer}/:offerId`,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin, GuardRequireRole.Haulier],
    },
    loadComponent: () =>
      import('./routes/haulier/current-offer-details/current-offer-details.component').then(
        (m) => m.CurrentOfferDetailsComponent,
      ),
  },
  {
    path: ROUTES.myOffersSelling,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading, GuardRequireRole.SuperAdmin],
      requireCompanyRole: [
        CompanyUserRequestRoleEnum.ADMIN,
        CompanyUserRequestRoleEnum.BOTH,
        CompanyUserRequestRoleEnum.SELLER,
      ],
    },
    loadComponent: () =>
      import('./routes/my-offers-selling/my-offers-selling.component').then((m) => m.MyOffersSellingComponent),
  },
  {
    path: ROUTES.myOffersBuying,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading, GuardRequireRole.SuperAdmin],
      requireCompanyRole: [
        CompanyUserRequestRoleEnum.ADMIN,
        CompanyUserRequestRoleEnum.BOTH,
        CompanyUserRequestRoleEnum.BUYER,
      ],
    },
    loadComponent: () =>
      import('./routes/my-offers-buying/my-offers-buying.component').then((m) => m.MyOffersBuyingComponent),
  },

  {
    path: `${ROUTES.offerDetail}/:offerId`,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading, GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/my-offers-detail/my-offers-detail.component').then((m) => m.MyOffersDetailComponent),
  },

  {
    path: `${ROUTES.myOffersBuyingDetail}/:offerId`,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading, GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/my-offer-buying-detail/my-offer-buying-detail.component').then(
        (m) => m.MyOfferBuyingDetailComponent,
      ),
  },

  {
    path: `${ROUTES.listingOfferDetail}/:offerId`,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading, GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/listing-offers-detail/listing-offers-detail.component').then(
        (m) => m.ListingOffersDetailComponent,
      ),
  },
  {
    path: `${ROUTES.wantedListingOfferDetail}/:offerId`,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading, GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/listing-offers-detail/listing-offers-detail.component').then(
        (m) => m.ListingOffersDetailComponent,
      ),
  },

  {
    path: `${ROUTES.sites}`,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading, GuardRequireRole.SuperAdmin],
    },
    component: MySitesComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./routes/my-sites/site-list/site-list.component').then((m) => m.SiteListComponent),
      },

      {
        path: 'add',
        data: {
          title: 'Add My Site',
        },
        loadComponent: () => import('./routes/my-sites/edit-site/edit-site.component').then((m) => m.EditSiteComponent),
      },
      {
        path: 'add/success',
        data: {
          title: 'Add Location',
        },
        loadComponent: () =>
          import('./routes/my-sites/add-success/add-success.component').then((m) => m.AddSuccessComponent),
      },
      {
        path: 'edit/:id',
        data: {
          title: 'Edit My Site',
        },
        loadComponent: () => import('./routes/my-sites/edit-site/edit-site.component').then((m) => m.EditSiteComponent),
      },

      {
        path: ':id',
        loadComponent: () =>
          import('./routes/my-sites/site-detail/site-detail.component').then((m) => m.SiteDetailComponent),
      },
    ],
  },

  {
    path: ROUTES.companyMembers,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard, CompanyAdminGuard],
    data: {
      requireAuthParams: [GuardRequireRole.Trading, GuardRequireRole.Haulier],
    },
    loadComponent: () =>
      import('./layout/company-member/company-member.component').then((m) => m.CompanyMemberComponent),
    children: [
      {
        path: '',
        redirectTo: 'incoming',
        pathMatch: 'full',
      },
      {
        path: 'incoming',
        loadComponent: () =>
          import('./layout/company-member/incoming/incoming.component').then((m) => m.IncomingComponent),
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./layout/company-member/members/members.component').then((m) => m.MembersComponent),
      },
    ],
  },
  {
    path: ROUTES.admin,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: ROUTES.liveActiveTable,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    component: LiveActiveTableComponent,
    children: [
      {
        path: 'purchases',
        loadComponent: () =>
          import('./routes/admin/live-active-table/purchases/purchases.component').then((m) => m.PurchasesComponent),
      },
      {
        path: 'listings',
        loadComponent: () =>
          import('./routes/admin/live-active-table/listings/listings.component').then((m) => m.ListingsComponent),
      },
      {
        path: 'wanted',
        loadComponent: () =>
          import('./routes/admin/live-active-table/wanted/wanted.component').then((m) => m.WantedComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'purchases' },
    ],
  },
  {
    path: ROUTES.commercialManagement,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    component: CommercialManagementComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'members' },
      {
        path: 'members',
        loadComponent: () =>
          import('./share/ui/admin/commercial/admin-member/admin-member.component').then((m) => m.AdminMemberComponent),
      },
      {
        path: 'sellers',
        loadComponent: () =>
          import('./share/ui/admin/commercial/admin-seller-activity/admin-seller-activity.component').then(
            (m) => m.AdminSellerActivityComponent,
          ),
      },
      {
        path: 'buyers',
        loadComponent: () =>
          import('./share/ui/admin/commercial/admin-buyer-activity/admin-buyer-activity.component').then(
            (m) => m.AdminBuyerActivityComponent,
          ),
      },
      {
        path: 'wanted',
        loadComponent: () =>
          import('./share/ui/admin/commercial/admin-wanted-activity/admin-wanted-activity.component').then(
            (m) => m.AdminWantedActivityComponent,
          ),
      },
      {
        path: 'haulage-bid',
        loadComponent: () =>
          import('./share/ui/admin/commercial/admin-haulage-bid/admin-haulage-bid.component').then(
            (m) => m.AdminHaulageBidComponent,
          ),
      },
      {
        path: 'samples',
        loadComponent: () =>
          import('./share/ui/admin/commercial/admin-samples/admin-samples.component').then(
            (m) => m.AdminSamplesComponent,
          ),
      },
      {
        path: 'mfi',
        loadComponent: () =>
          import('./share/ui/admin/commercial/admin-mfi/admin-mfi.component').then((m) => m.AdminMfiComponent),
      },
    ],
  },
  {
    path: ROUTES.auditTrail,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () => import('./routes/admin/audit-trail/audit-trail.component').then((m) => m.AuditTrailComponent),
  },
  {
    path: ROUTES.userManagement,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/user-management/user-management.component').then((m) => m.UserManagementComponent),
  },
  {
    path: `${ROUTES.adminDetail}/:id`,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/admin-detail/admin-detail.component').then((m) => m.AdminDetailComponent),
  },
  {
    path: `${ROUTES.adminSaleListingDetail}/:listingId`,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/detail-sale-listing/detail-sale-listing.component').then(
        (m) => m.DetailSaleListingComponent,
      ),
  },
  {
    path: `${ROUTES.adminMemberDetail}/:id`,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/member-detail/member-detail.component').then((m) => m.MemberDetailComponent),
  },
  {
    path: `${ROUTES.adminWantedListingDetail}/:listingId`,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/detail-wanted-listing/detail-wanted-listing.component').then(
        (m) => m.DetailWantedListingComponent,
      ),
  },
  {
    path: `${ROUTES.adminBuyerActivityDetail}/:offerId`,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/detail-buyer-activity/detail-buyer-activity.component').then(
        (m) => m.DetailBuyerActivityComponent,
      ),
  },
  {
    path: `${ROUTES.adminHaulageBid}/:bidId`,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/haulage-bid-detail/haulage-bid-detail.component').then((m) => m.HaulageBidDetailComponent),
  },
  {
    path: `${ROUTES.adminMakeOffer}/:offerId`,
    canActivate: [CanActivateAuthPage],
    data: {
      requireAuthParams: [GuardRequireRole.SuperAdmin],
    },
    loadComponent: () =>
      import('./routes/admin/admin-make-haulage-offer/admin-make-haulage-offer.component').then(
        (m) => m.AdminMakeHaulageOfferComponent,
      ),
  },
  {
    path: ROUTES.settings,
    canActivate: [CanActivateAuthPage, CompanyRoleGuard],
    component: AccountSettingComponent,
  },
  {
    path: ROUTES.landingPage,
    canActivate: [CanActivateAuthPage],
    loadComponent: () => import('./routes/landing-page/landing-page.component').then((m) => m.LandingPageComponent),
  },
  {
    path: ROUTES.requestSuccessHaulier,
    loadComponent: () =>
      import('./routes/request-success/request-success.component').then((m) => m.RequestSuccessComponent),
    data: { role: 'haulier' },
  },
  {
    path: ROUTES.requestSuccessTrader,
    loadComponent: () =>
      import('./routes/request-success/request-success.component').then((m) => m.RequestSuccessComponent),
    data: { role: 'trader' },
  },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];

export const routes: Routes = [
  // Spanish routes with /es prefix
  {
    path: 'es',
    children: appRoutes,
  },
  // English routes (default, no prefix)
  ...appRoutes,
];
