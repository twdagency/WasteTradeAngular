import { NotificationType } from '../notification';
import { CompanyUserRequestRoleEnum } from './company-user-request';

export interface Notification {
  createdAt: string;
  updatedAt: string;
  id: number;
  type: NotificationType;
  data: {
    createdAt?: string;
    status?: string;
    reason?: string;

    documentName?: string;
    expiryDate?: string;

    listingId?: string;
    listingTitle?: string;

    offerId?: string;

    // for renew
    isManual?: boolean;
    newEndDate?: string;

    // for haulier
    haulageOfferId: number;
    rejectionReason: string;
    pickupLocation: {
      id: number;
      city: string;
      street: string;
      country: string;
      postcode: string;
      addressLine: string;
    };
    destinationLocation: {
      id: number;
      city: string;
      street: string;
      country: string;
      postcode: string;
      addressLine: string;
    };

    // company member notifications
    newRole: CompanyUserRequestRoleEnum;
    oldRole: CompanyUserRequestRoleEnum;
    firstName: string;
    lastName: string;
    companyName: string;
  };
  isRead: boolean;
  readAt: string | null;
  userId: number;
}

export type GetNotificationsParams = {
  skip: number;
  limit: number;
};

export type GetNotificationsResponse = {
  results: Notification[];
  totalCount: number;
};

export type MarkNotificationReadResponse = {
  status: string;
  message: string;
  data: null;
};

export type MarkNotificationUnreadResponse = {
  status: string;
  message: string;
  data: null;
};

export type MarkAllNotificationsReadResponse = {
  status: string;
  message: string;
  data: null;
};

export type GetUnreadCountResponse = {
  status: string;
  message: string;
  data: {
    count: number;
  };
};
