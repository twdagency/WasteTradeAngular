import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, Inject, output, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { mapCountryCodeToName } from '@app/statics';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { NotificationItemComponent } from 'app/layout/notification/notification-item/notification-item.component';
import { AuthService } from 'app/services/auth.service';
import { NotificationService } from 'app/services/notification.service';
import { SpinnerComponent } from 'app/share/ui/spinner/spinner.component';
import { formatRole } from 'app/share/utils/company-member';
import { NotificationType, NotiItem } from 'app/types/notification';
import { Notification } from 'app/types/requests/notification';
import moment from 'moment';
import { catchError, delay, finalize, of, tap } from 'rxjs';

@Component({
  selector: 'app-notification-menu',
  imports: [
    MatMenuModule,
    MatButtonModule,
    NotificationItemComponent,
    CommonModule,
    MatIcon,
    SpinnerComponent,
    TranslateModule,
  ],
  providers: [],
  templateUrl: './notification-menu.component.html',
  styleUrl: './notification-menu.component.scss',
})
export class NotificationMenuComponent {
  @ViewChild('menu', { static: true }) menu!: MatMenu;
  @ViewChild('notiList', { static: true }) notiList!: ElementRef<HTMLDivElement>;

  reFetchNoti = output();

  private readonly perPage = 10;
  private notificationService = inject(NotificationService);
  private snackbar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  notifications = signal<NotiItem[] | undefined>(undefined);
  total = signal<number>(0);
  offset = signal(0);
  hasMoreNoti = signal(false);
  canViewMore = computed(() => this.hasMoreNoti() && this.total() > this.perPage);

  loading = signal(false);
  markAllAsReadLoading = signal(false);
  markReadLoading = signal(false);
  viewMoreLoading = signal(false);

  constructor(@Inject(MatMenu) private parentMenu: MatMenu) {}

  handleFetchNotifications() {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);

    return this.notificationService.getNotifications({ skip: this.offset(), limit: this.perPage }).pipe(
      tap((res) => {
        const hasMoreNoti = this.offset() + this.perPage < res.totalCount;
        this.hasMoreNoti.set(hasMoreNoti);
      }),
      finalize(() => {
        this.loading.set(false);
      }),
    );
  }

  // the notification component will trigger this method each time menu open
  initFetchNoti() {
    this.offset.set(0);
    this.handleFetchNotifications()
      ?.pipe(
        tap((res) => {
          const notiData = res.results.map((item) => this.transformNotiResToNotiItem(item));
          this.notifications.set(notiData);
          this.total.set(res.totalCount);
        }),
        catchError((error) => {
          console.error(error);
          this.snackbar.open('Failed to load notifications. Please refresh the page.');
          return of([]);
        }),
      )
      .subscribe();
  }

  transformNotiResToNotiItem(resItem: Notification): NotiItem {
    const { type, id, data, createdAt, isRead } = resItem;
    const isHaulier = this.authService.isHaulierUser;

    let title = '';
    let message = '';
    let linkText = '';
    let clickLink = () => {};

    switch (type) {
      case NotificationType.accountVerified:
        title = this.translate.instant(localized$('Account Verified'));
        const rawMessage = isHaulier
          ? 'Your WasteTrade account is now verified. You can browse the available loads.'
          : 'Your WasteTrade account is now verified. You can browse the marketplace, request info or samples, and create Listings and Wanted Listings.';
        message = this.translate.instant(localized$(rawMessage));

        linkText = this.translate.instant(localized$('Go to Platform'));
        clickLink = () => {
          this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
          this.handleClose();
        };
        break;

      case NotificationType.accountRejected:
        title = this.translate.instant(localized$('Account Verification Unsuccessful'));
        message = this.translate.instant(
          localized$(
            "We couldn't verify your account at this time{{reason}}. Please review and complete the required information (e.g., company documents, permits, full address) to continue.",
          ),
          { reason: data.reason ? '. ' + data.reason : '' },
        );
        linkText = this.translate.instant(localized$('View Profile'));
        clickLink = () => {
          this.router.navigateByUrl(`${ROUTES_WITH_SLASH.settings}?tabIndex=0`);
          this.handleClose();
        };
        break;

      case NotificationType.notificationEnabled:
        title = this.translate.instant(localized$('Personalised Notifications Enabled'));
        message = this.translate.instant(
          localized$(
            "You'll now receive tailored emails for Material and Wanted Listings that match your preferences. Adjust what you receive anytime.",
          ),
        );
        linkText = this.translate.instant(localized$('View Profile'));
        clickLink = () => {
          this.router.navigateByUrl(`${ROUTES_WITH_SLASH.settings}?tabIndex=0`);
          this.handleClose();
        };
        break;

      case NotificationType.profileUpdated:
        title = this.translate.instant(localized$('Profile Updated'));
        message = this.translate.instant(
          localized$(
            "Your profile information was updated successfully. If this wasn't you, contact support immediately to secure your account.",
          ),
        );
        linkText = this.translate.instant(localized$('Review Profile'));
        clickLink = () => {
          if (isHaulier) {
            this.router.navigate([ROUTES_WITH_SLASH.haulierProfile]);
          } else {
            this.router.navigateByUrl(`${ROUTES_WITH_SLASH.settings}?tabIndex=0`);
          }

          this.handleClose();
        };
        break;
      case NotificationType.documentExpiry:
        title = this.translate.instant(localized$('Document Expiry'));
        message = this.translate.instant(
          localized$(
            'Your document, {{documentName}}, expires on {{expiryDate}}. Please update your records to avoid disruption.',
          ),
          {
            documentName: data.documentName,
            expiryDate: data.expiryDate,
          },
        );
        linkText = this.translate.instant(localized$('Manage Documents'));
        clickLink = () => {
          this.router.navigateByUrl(`${ROUTES_WITH_SLASH.settings}?tabIndex=4`);
          this.handleClose();
        };
        break;

      case NotificationType.newListing:
        title = this.translate.instant(localized$('New Listing Added!'));
        message = this.translate.instant(
          localized$('A new material of interest has just been added to our system: {{listingTitle}}.'),
          { listingTitle: data.listingTitle },
        );
        linkText = this.translate.instant(localized$('View Material Listing'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.listingOfferDetail, data.listingId]);
          this.handleClose();
        };
        break;

      case NotificationType.bidStatus:
        title = this.translate.instant(localized$('Bid Status Update'));
        message = this.translate.instant(
          localized$('Your bid on {{listingTitle}} on {{bidDate}} has been updated to {{status}}.'),
          {
            listingTitle: data.listingTitle,
            bidDate: moment(data.createdAt).format('DD/MM/YYYY'),
            status: data.status,
          },
        );
        linkText = this.translate.instant(localized$('View Material Listing'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.listingOfferDetail, data.listingId]);
          this.handleClose();
        };
        break;

      case NotificationType.listingApproved:
        title = this.translate.instant(localized$('Listing Approved'));
        message = this.translate.instant(
          localized$('Your listing {{listingTitle}} has been approved and is now live.'),
          { listingTitle: data.listingTitle },
        );
        linkText = this.translate.instant(localized$('View Material Listing'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.listingOfferDetail, data.listingId]);
          this.handleClose();
        };
        break;

      case NotificationType.listingRejected:
        title = this.translate.instant(localized$('Listing Rejected'));
        message = this.translate.instant(
          localized$(
            'Your listing {{listingTitle}} has been rejected by the admin{{reason}}. Please create a new listing.',
          ),
          {
            listingTitle: data.listingTitle,
            reason: data.reason ? '. ' + data.reason : '',
          },
        );
        linkText = this.translate.instant(localized$('View Marketplace'));
        clickLink = () => {
          this.router.navigateByUrl(ROUTES_WITH_SLASH.buy);
          this.handleClose();
        };
        break;

      case NotificationType.listingMoreInfoRequired:
        title = this.translate.instant(localized$('Listing Requires More Information'));
        message = this.translate.instant(
          localized$(
            'Your listing {{listingTitle}} has been rejected by the admin. Please update the listing information and resubmit.',
          ),
          { listingTitle: data.listingTitle },
        );
        linkText = this.translate.instant(localized$('View Material Listing'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.listingOfferDetail, data.listingId]);
          this.handleClose();
        };
        break;

      case NotificationType.listingExpiryWarning:
        title = this.translate.instant(localized$('Listing About to Expire'));
        message = this.translate.instant(localized$('Your listing {{listingTitle}} will expire in 7 days.'), {
          listingTitle: data.listingTitle,
        });
        linkText = this.translate.instant(localized$('View Material Listing'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.listingOfferDetail, data.listingId]);
          this.handleClose();
        };
        break;

      case NotificationType.listingRenewed:
        title = this.translate.instant(localized$('Listing Renewed'));
        message = this.translate.instant(
          localized$('{{listingTitle}} has been renewed {{type}}. New end date: {{newEndDate}}.'),
          {
            type: data.isManual ? 'manually' : 'automatically',
            newEndDate: moment(data.newEndDate).format('DD/MM/YYYY'),
            listingTitle: data.listingTitle,
          },
        );
        linkText = this.translate.instant(localized$('View Material Listing'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.listingOfferDetail, data.listingId]);
          this.handleClose();
        };
        break;

      case NotificationType.offerApproved:
        title = this.translate.instant(localized$('Offer Approved'));
        message = this.translate.instant(
          localized$('Buyer and haulage confirmed for {{listingTitle}}. Review terms and next steps.'),
          {
            listingTitle: data.listingTitle,
          },
        );
        linkText = this.translate.instant(localized$('View Offer'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.offerDetail, data.offerId]);
          this.handleClose();
        };
        break;

      case NotificationType.haulage_offer_approved:
        title = this.translate.instant(localized$('Offer Approved'));
        message = this.translate.instant(
          localized$(
            'Your haulage Offer from {{pickupLocation}} to {{destinationLocation}} has been approved, Wastetrade will be in touch shortly, all relevant documentation will be provided 3 days before the confirmed delivery date.',
          ),
          {
            pickupLocation: mapCountryCodeToName[data.pickupLocation.country],
            destinationLocation: mapCountryCodeToName[data.destinationLocation.country],
          },
        );
        linkText = this.translate.instant(localized$('View Offer'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.currentOffers, data.haulageOfferId]);
          this.handleClose();
        };
        break;

      case NotificationType.haulage_offer_rejected:
        title = this.translate.instant(localized$('Offer Rejected'));
        message = this.translate.instant(
          localized$(
            'Your haulage Offer from {{pickupLocation}} to {{destinationLocation}} has been rejected by the admin. {{reason}} Please create a new Offer.',
          ),
          {
            pickupLocation: mapCountryCodeToName[data.pickupLocation.country],
            destinationLocation: mapCountryCodeToName[data.destinationLocation.country],
            reason: data.rejectionReason,
          },
        );
        linkText = this.translate.instant(localized$('View Offer'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.currentOffers, data.haulageOfferId]);
          this.handleClose();
        };
        break;

      case NotificationType.haulage_offer_request_information:
        title = this.translate.instant(localized$('Offer Requires More Information'));
        message = this.translate.instant(
          localized$(
            'Your haulage Offer from {{pickupLocation}} to {{destinationLocation}} requires more information. Please update the Offer information and resubmit.',
          ),
          {
            pickupLocation: mapCountryCodeToName[data.pickupLocation.country],
            destinationLocation: mapCountryCodeToName[data.destinationLocation.country],
          },
        );
        linkText = this.translate.instant(localized$('View Offer'));
        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.currentOffers, data.haulageOfferId]);
          this.handleClose();
        };
        break;

      case NotificationType.new_haulage_opportunity:
        title = this.translate.instant(localized$('New Haulage Opportunity'));
        message = this.translate.instant(localized$('You have a new haulage opportunity.'));
        linkText = this.translate.instant(localized$('View Available Loads'));

        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.availableLoads]);
          this.handleClose();
        };
        break;

      case NotificationType.company_user_request_join:
        title = this.translate.instant(localized$('New Join Request'));
        message = this.translate.instant(localized$('{{firstName}} {{lastName}} requested to join {{companyName}}.'), {
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
        });
        linkText = this.translate.instant(localized$('Review Requests'));

        clickLink = () => {
          this.router.navigate([ROUTES_WITH_SLASH.companyMembers]);
          this.handleClose();
        };
        break;

      case NotificationType.company_user_accepted_invite:
        title = this.translate.instant(localized$('Company Invite Accepted'));
        message = this.translate.instant(
          localized$('{{firstName}} {{lastName}} has accepted to join {{companyName}}.'),
          {
            firstName: data.firstName,
            lastName: data.lastName,
            companyName: data.companyName,
          },
        );

        clickLink = () => {
          this.router.navigateByUrl(`${ROUTES_WITH_SLASH.settings}?tabIndex=0`);
          this.handleClose();
        };
        break;

      case NotificationType.company_user_role_changed:
        title = this.translate.instant(localized$('Role Updated'));
        message = this.translate.instant(localized$('Your role is now {{newRole}}. Permissions updated.'), {
          newRole: formatRole(data.newRole),
        });
        linkText = this.translate.instant(localized$('View Role'));
        clickLink = () => {
          this.router.navigateByUrl(`${ROUTES_WITH_SLASH.settings}?tabIndex=0`);
          this.handleClose();
        };
        break;

      case NotificationType.company_user_unlinked_from_company:
        title = this.translate.instant(localized$('Removed from Company'));
        message = this.translate.instant(
          localized$(
            'Your access to {{companyName}} has been removed. You will need to populate your profile with updated company details.',
          ),
          {
            companyName: data.companyName,
          },
        );

        clickLink = () => {
          this.handleClose();
        };
        break;

      default:
        title = this.translate.instant(localized$('Notification'));
        message = this.translate.instant(localized$('You have a new notification.'));
        linkText = '';
        clickLink = () => {};
        break;
    }

    const rs: NotiItem = {
      id,
      title,
      message,
      time: moment(createdAt).format('DD/MM/YYYY LT'),
      read: isRead,
      linkText,
      clickLink,
    };
    return rs;
  }

  handleViewmore() {
    if (this.viewMoreLoading()) return;

    this.viewMoreLoading.set(true);
    this.offset.update((pre) => pre + this.perPage);
    this.handleFetchNotifications()
      ?.pipe(
        delay(300),
        tap((res) => {
          const notiData = res.results.map((item) => this.transformNotiResToNotiItem(item));

          this.notifications.set(notiData);
        }),
        catchError(() => {
          this.snackbar.open('Unable to load notifications. Please try again.');
          return of([]);
        }),
        finalize(() => {
          this.viewMoreLoading.set(false);
        }),
      )
      .subscribe();
  }

  handleReadAll() {
    if (this.markAllAsReadLoading()) {
      return;
    }

    this.markAllAsReadLoading.set(true);
    this.notificationService
      .markAllNotificationsAsRead()
      .pipe(
        tap(() => {
          this.offset.set(0);
          this.initFetchNoti();
          this.reFetchNoti.emit();
        }),
        finalize(() => {
          this.markAllAsReadLoading.set(false);
        }),
        catchError(() => {
          this.snackbar.open(
            this.translate.instant(localized$('Unable to mark notification as read. Please try again.')),
          );
          return of([]);
        }),
      )
      .subscribe();
  }

  onRead(noti: NotiItem) {
    if (this.markReadLoading() || noti.read) {
      return;
    }

    this.markReadLoading.set(true);

    this.notificationService
      .markNotificationAsRead(noti.id)
      .pipe(
        tap(() => {
          this.notifications.update((pre) => {
            return pre?.map((item) => {
              if (item.id === noti.id) {
                return { ...item, read: true };
              }

              return item;
            });
          });
        }),
        finalize(() => {
          this.markReadLoading.set(false);
        }),
      )
      .subscribe();

    this.reFetchNoti;
  }

  onUnread(noti: NotiItem) {
    if (this.markReadLoading() || !noti.read) {
      return;
    }

    this.markReadLoading.set(true);

    this.notificationService
      .markNotificationAsUnRead(noti.id)
      .pipe(
        tap(() => {
          this.notifications.update((pre) => {
            return pre?.map((item) => {
              if (item.id === noti.id) {
                return { ...item, read: false };
              }

              return item;
            });
          });
        }),
        finalize(() => {
          this.markReadLoading.set(false);
        }),
      )
      .subscribe();
  }

  handleClose() {
    this.parentMenu.closed.emit();
  }
}
