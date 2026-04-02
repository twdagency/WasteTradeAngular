import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { User } from 'app/models/auth.model';
import { AuthService, NOT_INITIAL_USER } from 'app/services/auth.service';
import { HeaderService } from 'app/services/header.service';
import { Permission, PermissionService } from 'app/services/permission.service';
import { Role } from 'app/types/auth';
import { CompanyUserRequestRoleEnum } from 'app/types/requests/company-user-request';
import { isNil } from 'lodash';
import { filter, first, map } from 'rxjs';
import { IconComponent } from '../icon/icon.component';

function dashboardChildRoute(childRoute: string) {
  return `${ROUTES_WITH_SLASH.commercialManagement}${childRoute}`;
}

@Component({
  selector: 'app-sidebar',
  imports: [IconComponent, MatIconModule, RouterModule, TranslateModule, MatExpansionModule, NgTemplateOutlet],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  providers: [TranslatePipe],
})
export class SidebarComponent {
  user: Signal<User | undefined | null>;
  Role = Role;

  private authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  translate = inject(TranslatePipe);
  private readonly permissionService = inject(PermissionService);

  permission = toSignal(this.permissionService.permission);
  companyRole = toSignal(
    this.authService.user$.pipe(
      filter((user) => user !== NOT_INITIAL_USER),
      map((user) => user?.companyRole),
    ),
  );

  openChildMenuIndices = signal<Set<number>>(new Set());

  haulierMenu = computed(() => {
    let menu = [
      {
        title: localized$('Available Loads'),
        link: ROUTES_WITH_SLASH.availableLoads,
        icon: 'recycling',
        iconClass: 'highlight',
        backgroundColor: '#03985c',
      },
      {
        title: localized$('Current Offers'),
        link: ROUTES_WITH_SLASH.currentOffers,
        icon: 'ballot',
        iconClass: 'highlight',
        backgroundColor: '#03985c',
      },

      {
        title: localized$('Company Members'),
        link: ROUTES_WITH_SLASH.companyMembers,
        icon: 'group',
        iconClass: 'highlight',
      },
    ];

    if (this.companyRole() !== CompanyUserRequestRoleEnum.ADMIN) {
      menu = menu.filter((item) => item.link !== ROUTES_WITH_SLASH.companyMembers);
    }

    return menu;
  });

  listMenuPlatform = computed(() => {
    let menu = [
      {
        title: localized$('Buy Materials'),
        link: ROUTES_WITH_SLASH.buy,
        icon: 'recycling',
        iconClass: 'highlight',
        backgroundColor: '#03985c',
      },
      {
        title: localized$('Wanted Materials'),
        link: ROUTES_WITH_SLASH.wanted,
        icon: 'notification_important',
        iconClass: 'highlight',
        backgroundColor: '#03985c',
      },
      {
        title: localized$('Create Listing'),
        icon: 'library_add',
        backgroundColor: '#03985c',
        children: [
          {
            title: localized$('Sell Material'),
            link: ROUTES_WITH_SLASH.sell,
            disabled: false,
            icon: 'ballot',
            group: 'sellerManagementPermission',
          },
          {
            title: localized$('List Wanted Material'),
            link: ROUTES_WITH_SLASH.createWantedListing,
            disabled: false,
            icon: 'ballot',
            group: 'buyerManagementPermission',
          },
        ],
      },
      {
        title: localized$('My Listings'),
        icon: 'library_books',
        children: [
          {
            title: localized$('Sales Listings'),
            link: ROUTES_WITH_SLASH.saleListings,
            icon: 'ballot',
            disabled: false,
            group: 'sellerManagementPermission',
          },
          {
            title: localized$('Wanted Listings'),
            link: ROUTES_WITH_SLASH.wantedListings,
            icon: 'ballot',
            disabled: false,
            group: 'buyerManagementPermission',
          },
        ],
      },

      {
        title: localized$('My Offers'),
        icon: 'ballot',
        // icon: 'more-icon',
        children: [
          {
            title: localized$('Buyer'),
            link: ROUTES_WITH_SLASH.myOffersBuying,
            icon: 'ballot',
            disabled: false,
            group: 'buyerManagementPermission',
          },
          {
            title: localized$('Seller'),
            link: ROUTES_WITH_SLASH.myOffersSelling,
            icon: 'ballot',
            disabled: false,
            group: 'sellerManagementPermission',
          },
        ],
      },

      {
        title: localized$('My Sites'),
        link: `${ROUTES_WITH_SLASH.settings}?tabIndex=5`,
        icon: 'location_on',
      },
      {
        title: localized$('Company Members'),
        link: ROUTES_WITH_SLASH.companyMembers,
        icon: 'group',
      },
    ];

    const permission = this.permission();
    if (permission) {
      menu.forEach((item) => {
        const children = item.children?.filter((childItem, index) => {
          if (
            (permission as Permission).cantUseBuyerManagePermission &&
            childItem.group === 'buyerManagementPermission'
          ) {
            return false;
          }

          if (
            (permission as Permission).cantUseSellerManagePermission &&
            childItem.group === 'sellerManagementPermission'
          ) {
            return false;
          }

          return true;
        }) as any;

        item.children = children;
      });
    }

    if (this.companyRole() !== CompanyUserRequestRoleEnum.ADMIN) {
      menu = menu.filter((item) => item.link !== ROUTES_WITH_SLASH.companyMembers);
    }

    return menu;
  });

  get isHaulierUser() {
    return this.authService.isHaulierUser;
  }

  constructor(
    public headerService: HeaderService,
    private router: Router,
  ) {
    this.user = toSignal(this.authService.user$);

    this.router.events.pipe(first()).subscribe(() => {
      const currentUrl = this.router.url;
      const parentIndex = this.listMenuPlatform()?.findIndex((item) =>
        item.children?.some((child) => child.link === currentUrl),
      );

      if (isNil(parentIndex)) {
        return;
      }

      if (parentIndex !== -1) {
        this.openChildMenuIndices.update((indices) => new Set(indices).add(parentIndex));
      }
    });
  }

  adminMenu = signal([
    {
      title: localized$('Dashboard'),
      icon: undefined,
      iconClass: 'highlight',
      children: [
        {
          title: localized$('Users'),
          link: `${ROUTES_WITH_SLASH.commercialManagement}/members`,
          icon: undefined,

          disabled: false,
        },
        {
          title: localized$('Listings'),
          link: `${ROUTES_WITH_SLASH.commercialManagement}/sellers`,
          icon: undefined,

          disabled: false,
        },
        {
          title: localized$('Wanted'),
          link: `${ROUTES_WITH_SLASH.commercialManagement}/wanted`,
          icon: undefined,

          disabled: false,
        },
        {
          title: localized$('Offers'),
          link: `${ROUTES_WITH_SLASH.commercialManagement}/buyers`,
          icon: undefined,

          disabled: false,
        },
        {
          title: localized$('Haulage Bids'),
          link: `${ROUTES_WITH_SLASH.commercialManagement}/haulage-bid`,
          icon: undefined,

          disabled: false,
        },
        {
          title: localized$('Samples'),
          link: `${ROUTES_WITH_SLASH.commercialManagement}/samples`,
          icon: undefined,

          disabled: false,
        },
        {
          title: localized$('MFI Tests'),
          link: `${ROUTES_WITH_SLASH.commercialManagement}/mfi`,
          icon: undefined,

          disabled: false,
        },
      ],
    },
    {
      title: localized$('User management'),
      link: ROUTES_WITH_SLASH.userManagement,
      icon: undefined,
      iconClass: 'highlight',
    },
    {
      title: localized$('Document management'),
      link: undefined,
      isTempLink: true,
      icon: undefined,
      iconClass: 'highlight',
    },
    {
      title: localized$('Content management'),
      link: undefined,
      isTempLink: true,
      icon: undefined,
      iconClass: 'highlight',
    },
    {
      title: localized$('Analytics'),
      link: undefined,
      isTempLink: true,
      icon: undefined,
      iconClass: 'highlight',
    },
    {
      title: localized$('Settings'),
      link: undefined,
      isTempLink: true,
      icon: undefined,
      iconClass: 'highlight',
    },

    {
      title: localized$('Audit Trail'),
      link: ROUTES_WITH_SLASH.auditTrail,
      icon: undefined,
      iconClass: 'highlight',
    },
  ]);

  toggleChildMenu(index: number, item: any, event: any) {
    const newLink = item.link;
    if (item.children) {
      this.openChildMenuIndices.update((indices) => {
        const newSet = new Set(indices);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
      event.preventDefault();
    } else {
      this.router.navigateByUrl(newLink);
    }
  }

  isChildMenuOpen(index: number): boolean {
    return this.openChildMenuIndices().has(index);
  }

  clickChildMenu(event: MouseEvent, item: any) {
    if (item.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const newLink = item.link;
    this.router.navigateByUrl(newLink);
  }

  goToBuyPage() {
    this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
  }

  onComingSoon() {
    this.snackbar.open(this.translate.transform(localized$('Coming Soon !')));
  }
}
