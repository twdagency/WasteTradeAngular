import { Location } from '@angular/common';
import { Component, DestroyRef, inject, Injector, PLATFORM_ID, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { AdminCommercialService } from 'app/services/admin/admin-commercial.service';
import { AdminHaulageService } from 'app/services/admin/admin-haulage.service';
import { ListingService } from 'app/services/listing.service';
import { OfferService } from 'app/services/offer.service';
import { AssignService } from 'app/share/ui/admin/commercial/admin-member/assign-service/assign.service';
import { AdminLayoutComponent } from '../../../layout/admin-layout/admin-layout.component';

enum TabPath {
  members = 'members',
  sellers = 'sellers',
  buyers = 'buyers',
  wanted = 'wanted',
  haulageBid = 'haulage-bid',
}

@Component({
  selector: 'app-commercial-management',
  templateUrl: './commercial-management.component.html',
  styleUrls: ['./commercial-management.component.scss'],
  imports: [AdminLayoutComponent, MatTabsModule, MatIconModule, RouterModule, TranslateModule],
  providers: [AdminCommercialService, OfferService],
})
export class CommercialManagementComponent {
  router = inject(Router);
  activeTab = signal(0);
  selectedIndex = 0;
  destroyRef = inject(DestroyRef);

  activeRoute = inject(ActivatedRoute);
  location = inject(Location);
  activatedRoute = inject(ActivatedRoute);
  listingsService = inject(ListingService);
  offerService = inject(OfferService);
  adminCommercialService = inject(AdminCommercialService);
  injector = inject(Injector);
  platformId = inject(PLATFORM_ID);
  adminHaulageService = inject(AdminHaulageService);
  private assignService = inject(AssignService);

  initTab = Number(this.activeRoute.snapshot.queryParams['tab'] ?? 0);
  // needCheck = signal<any>({
  //   sellers: false,
  //   buyers: false,
  //   wanted: false,
  // });

  listTabs = [
    { label: localized$('USERS'), path: TabPath.members },
    { label: localized$('LISTINGS'), path: TabPath.sellers },
    { label: localized$('OFFERS'), path: TabPath.buyers },
    { label: localized$('WANTED LISTINGS'), path: TabPath.wanted },
    { label: localized$('HAULAGE BID'), path: TabPath.haulageBid },
  ];

  pendingCount = signal<Record<TabPath, number | undefined>>({
    [TabPath.members]: undefined,
    [TabPath.buyers]: undefined,
    [TabPath.sellers]: undefined,
    [TabPath.wanted]: undefined,
    [TabPath.haulageBid]: undefined,
  });

  ngOnInit() {
    this.assignService.getAssignableAdmins().subscribe();
  }

  get indexOfTab(): number {
    const routes = Object.values(this.listTabs).map((tab) => tab.path);

    const child = this.activatedRoute.firstChild;
    const tabName = child?.snapshot.url[0]?.path as TabPath;

    if (tabName) {
      return routes.indexOf(tabName);
    }
    return 0;
  }

  onBack() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.commercialManagement);
  }

  onTabChange(event: MatTabChangeEvent) {
    const segment = this.listTabs[event.index].path;
    this.router.navigate([segment], { relativeTo: this.activatedRoute });
  }
}
