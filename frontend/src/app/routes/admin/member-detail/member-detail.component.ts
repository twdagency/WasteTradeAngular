import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { TabContainerComponent } from 'app/routes/account-settings/tab-container/tab-container.component';
import { AdminCommercialService } from 'app/services/admin/admin-commercial.service';
import { AdminMembersComponent } from 'app/share/ui/admin/member-detail/admin-members/admin-members.component';
import { ItemOf } from 'app/types/utils';
import { catchError, map, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { AdminLayoutComponent } from '../../../layout/admin-layout/admin-layout.component';
import { AdminCompanyDocumentComponent } from '../../../share/ui/admin/member-detail/admin-company-document/admin-company-document.component';
import { AdminCompanyInformationComponent } from '../../../share/ui/admin/member-detail/admin-company-information/admin-company-information.component';
import { AdminMaterialPreferenceComponent } from '../../../share/ui/admin/member-detail/admin-material-preference/admin-material-preference.component';
import { AdminMemberLocationComponent } from '../../../share/ui/admin/member-detail/admin-member-location/admin-member-location.component';
import { AdminPersonalInformationComponent } from '../../../share/ui/admin/member-detail/admin-personal-information/admin-personal-information.component';
import { MemberDetailActionsComponent } from '../../../share/ui/admin/member-detail/member-detail-actions/member-detail-actions.component';
import { SpinnerComponent } from '../../../share/ui/spinner/spinner.component';

const ListTab = [
  {
    icon: 'account_circle',
    title: localized$('Profile'),
  },
  {
    icon: 'info',
    title: localized$('Company Info'),
  },
  {
    icon: 'filter_list',
    title: localized$('Material preferences'),
  },
  {
    icon: 'notifications_active',
    title: localized$('Notifications'),
  },
  {
    icon: 'assignment',
    title: localized$('Company documents'),
  },
  {
    icon: 'location_on',
    title: localized$('Locations'),
  },
  {
    icon: 'location_on',
    title: localized$('Members'),
  },
] as const;

type TabKey = ItemOf<typeof ListTab>['title'];

@Component({
  selector: 'app-member-detail',
  imports: [
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    AdminLayoutComponent,
    SpinnerComponent,
    AdminPersonalInformationComponent,
    AdminCompanyInformationComponent,
    AdminCompanyInformationComponent,
    AdminMaterialPreferenceComponent,
    MemberDetailActionsComponent,
    AdminCompanyDocumentComponent,
    AdminMemberLocationComponent,
    TranslateModule,
    TabContainerComponent,
    AdminMembersComponent,
  ],
  providers: [AdminCommercialService, TranslatePipe],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss',
})
export class MemberDetailComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  commercialService = inject(AdminCommercialService);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  platformId = inject(PLATFORM_ID);

  listTab = ListTab;
  updator = new Subject<void>();
  memberId = this.route.snapshot.params['id'];
  loadingUser = signal(false);
  activeTab = signal<number | undefined>(undefined);

  ngOnInit() {
    // Read tab from query parameters on initialization
    const tabParam = this.route.snapshot.queryParams['tab'];
    if (tabParam !== undefined && tabParam !== null) {
      const tabIndex = parseInt(tabParam, 10);
      if (tabIndex >= 0 && tabIndex < this.listTab.length) {
        this.activeTab.set(tabIndex);
      }
    }
  }

  user = toSignal(
    this.updator.pipe(
      startWith(null), // Trigger initial load
      tap(() => this.loadingUser.set(true)),
      switchMap(() => this.commercialService.getMemberDetail(this.memberId)),
      catchError((error) => {
        this.snackBar.open(
          this.translate.transform(localized$('Unable to load member profile data. Please try again')),
        );
        console.error('Error fetching member detail:', error);
        return of({
          data: null,
        });
      }),
      map((res) => res.data),
      tap(() => this.loadingUser.set(false)),
    ),
  );

  selectTab(key: TabKey) {
    const index = ListTab.findIndex((i) => i.title === key);
    this.activeTab.set(index);

    // Update query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: index },
      queryParamsHandling: 'merge',
    });
  }

  closeTab() {
    this.activeTab.set(undefined);

    // Remove tab query parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: null },
      queryParamsHandling: 'merge',
    });
  }

  onTabChange(event: any) {
    const tabIndex = event.index;
    this.activeTab.set(tabIndex);

    // Update query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabIndex },
      queryParamsHandling: 'merge',
    });
  }

  onBack() {
    this.router.navigateByUrl(`${ROUTES_WITH_SLASH.commercialManagement}?tab=0`);
  }

  refresh() {
    this.updator.next();
  }
}
