import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as localized$ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import {
  GetNotificationsParams,
  GetNotificationsResponse,
  GetUnreadCountResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  MarkNotificationUnreadResponse,
} from 'app/types/requests/notification';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  /**
   * Get all notifications for the current user
   * POST /waste-trade-notifications
   */
  getNotifications(params: GetNotificationsParams) {
    return this.http.get<GetNotificationsResponse>('/waste-trade-notifications', {
      params: {
        filter: JSON.stringify(params),
      },
    });
  }

  /**
   * Mark a specific notification as read
   * PATCH /waste-trade-notifications/{notificationId}/mark-read
   * @param notificationId - The ID of the notification to mark as read
   */
  markNotificationAsRead(notificationId: number) {
    return this.http
      .patch<MarkNotificationReadResponse>(`/waste-trade-notifications/${notificationId}/mark-read`, {})
      .pipe(
        catchError((err) => {
          this.snackbar.open(
            this.translate.instant(localized$('Failed to mark notification as read. Please try again.')),
          );
          return throwError(() => err);
        }),
      );
  }

  /**
   * Mark a specific notification as unread
   * PATCH /waste-trade-notifications/{notificationId}/mark-unread
   * @param notificationId - The ID of the notification to mark as unread
   */
  markNotificationAsUnRead(notificationId: number) {
    return this.http
      .patch<MarkNotificationUnreadResponse>(`/waste-trade-notifications/${notificationId}/mark-unread`, {})
      .pipe(
        catchError((err) => {
          this.snackbar.open(
            this.translate.instant(
              localized$('Failed to mark notification as unread. Please try again.'),
            ),
          );
          return throwError(() => err);
        }),
      );
  }

  /**
   * Mark all notifications as read
   * PATCH /waste-trade-notifications/mark-all-read
   */
  markAllNotificationsAsRead() {
    return this.http.patch<MarkAllNotificationsReadResponse>('/waste-trade-notifications/mark-all-read', {});
  }

  /**
   * Get the count of unread notifications
   * GET /waste-trade-notifications/unread/count
   */
  getUnreadCount() {
    return this.http.get<GetUnreadCountResponse>('/waste-trade-notifications/unread/count').pipe(
      catchError((err) => {
        this.snackbar.open(
          this.translate.instant(
            localized$('Unable to load unread notification count. Please refresh the page and try again.'),
          ),
        );
        return throwError(() => err);
      }),
    );
  }
}
