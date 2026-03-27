import { Router } from '@angular/router';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { ROUTES_WITH_SLASH } from 'app/constants/route.const';
import { EmptyOfferButton } from 'app/share/ui/my-offers/empty-offer/empty-offer.component';

export enum OfferType {
  Received = 'received',
  Pending = 'pending',
  Rejected = 'rejected',
  Accepted = 'accepted',
}

export const LIST_TAB_OFFER = [
  {
    label: localized$('All'),
    key: OfferType.Received,
  },
  // {
  //   label: 'Pending offers',
  //   key: OfferType.Pending,
  // },
  // {
  //   label: 'Accepted Offers',
  //   key: OfferType.Accepted,
  // },
  // {
  //   label: 'Rejected Offers',
  //   key: OfferType.Rejected,
  // },
];

export const MAP_OFFER_TYPE_TO_EMPTY_OFFER_PROP = (
  router: Router,
): Record<
  OfferType,
  {
    title: string;
    content: string;
    buttons: EmptyOfferButton[];
  }
> => ({
  [OfferType.Received]: {
    title: localized$('You currently have no offers.'),
    content: localized$(
      'There are no ongoing bids on your listings at the moment. Keep an eye on your dashboard for updates, or consider promoting your items to attract more interest by listing new materials.',
    ),
    buttons: [
      {
        label: localized$('sell new material'),
        onClick: () => {
          router.navigateByUrl(ROUTES_WITH_SLASH.sell);
        },
      },
      {
        label: localized$('view wanted listing'),
        type: 'stroke',
        onClick: () => {
          router.navigateByUrl(ROUTES_WITH_SLASH.wanted);
        },
      },
    ],
  },

  [OfferType.Accepted]: {
    title: localized$('You currently have no offers.'),
    content: localized$(
      'There are no ongoing bids on your listings at the moment. Keep an eye on your dashboard for updates, or consider promoting your items to attract more interest by listing new materials.',
    ),
    buttons: [
      {
        label: localized$('sell new material'),
        onClick: () => {
          router.navigateByUrl(ROUTES_WITH_SLASH.sell);
        },
      },
      {
        label: localized$('view wanted listing'),
        type: 'stroke',
        onClick: () => {
          router.navigateByUrl(ROUTES_WITH_SLASH.wanted);
        },
      },
    ],
  },

  [OfferType.Rejected]: {
    title: localized$('You currently have no offers.'),
    content: localized$(
      'There are no ongoing bids on your listings at the moment. Keep an eye on your dashboard for updates, or consider promoting your items to attract more interest by listing new materials.',
    ),
    buttons: [
      {
        label: localized$('sell new material'),
        onClick: () => {
          router.navigateByUrl(ROUTES_WITH_SLASH.sell);
        },
      },
      {
        label: localized$('view wanted listing'),
        type: 'stroke',
        onClick: () => {
          router.navigateByUrl(ROUTES_WITH_SLASH.wanted);
        },
      },
    ],
  },

  [OfferType.Pending]: {
    title: localized$('You currently have no pending offers.'),
    content: localized$(
      'There are no ongoing bids on your listings at the moment. Keep an eye on your dashboard for updates, or consider promoting your items to attract more interest by listing new materials.',
    ),
    buttons: [
      {
        label: localized$('sell new material'),
        onClick: () => {
          router.navigateByUrl(ROUTES_WITH_SLASH.sell);
        },
      },
      {
        label: localized$('view wanted listing'),
        type: 'stroke',
        onClick: () => {
          router.navigateByUrl(ROUTES_WITH_SLASH.wanted);
        },
      },
    ],
  },
});
