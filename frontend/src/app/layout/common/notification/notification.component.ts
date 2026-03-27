import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, computed, inject, Injector, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NotificationMenuComponent } from 'app/layout/notification/notification-menu/notification-menu.component';
import { NotificationService } from 'app/services/notification.service';
import { startWith, Subject, switchMap, tap, timer } from 'rxjs';
@Component({
  selector: 'app-notification',
  imports: [MatIconModule, NotificationMenuComponent, MatMenu, MatMenuTrigger],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements AfterViewInit {
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('notificationMenuComponent') notificationMenuComponent!: NotificationMenuComponent;
  injector = inject(Injector);

  unReadNoti = signal(0);
  amount = computed(() => (this.unReadNoti() > 9 ? `9+` : this.unReadNoti()));
  fetcher$ = new Subject<void>();
  private platformId = inject(PLATFORM_ID);
  private notificationService = inject(NotificationService);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetcher$
        .pipe(
          startWith(0),
          switchMap(() => timer(0, 15000)),
          switchMap(() => this.notificationService.getUnreadCount()),
          tap((data) => {
            this.unReadNoti.set(data.data.count);
          }),
          takeUntilDestroyed(),
        )
        .subscribe();
    }
  }

  ngAfterViewInit() {
    // Subscribe to menu opened event to trigger notification fetch
    this.menuTrigger.menuOpened.subscribe(() => {
      this.notificationMenuComponent.initFetchNoti();
    });
  }

  fetchUnReadNoti() {}

  onReFetchNoti() {
    this.unReadNoti.set(0);
    this.fetcher$.next();
  }
}
